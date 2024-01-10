const cheerio = require("cheerio");
const { flatMap, includes, compact, find, get } = require("lodash");
const { unescapePiping, removeDash } = require("../HTMLUtils");
const { placeholderObjectBuilder } = require("./PlaceholderObjectBuilder");

const getMetadata = (ctx, metadataId) =>
  ctx.questionnaireJson.metadata.find(({ id }) => id === metadataId);

const isPipeableType = (answer) => {
  const notPipeableAnswerTypes = ["TextArea", "CheckBox"];
  const { type } = answer;
  return !includes(notPipeableAnswerTypes, type);
};

const getAnswers = (questionnaire) =>
  flatMap(questionnaire.sections, (section) =>
    flatMap(section.folders, (folder) =>
      compact(flatMap(folder.pages, (page) => page.answers))
    )
  );

const getSuplementaryField = (ctx, sourceId) => {
  return find(
    flatMap(ctx.questionnaireJson.supplementaryData.data, "schemaFields"),
    { id: sourceId }
  );
};

const getListAnswers = (questionnaire) =>
  flatMap(get(questionnaire, "collectionLists.lists", []), (list) =>
    compact(list.answers)
  );

const getAllAnswers = (questionnaire) => {
  return [...getAnswers(questionnaire), ...getListAnswers(questionnaire)];
};

const getAnswer = (ctx, answerId) =>
  getAllAnswers(ctx.questionnaireJson)
    .filter((answer) => isPipeableType(answer))
    .find((answer) => answer.id === answerId);

const getAllCalculatedSummaries = (questionnaire) =>
  flatMap(questionnaire.sections, (section) =>
    flatMap(section.folders, (folder) =>
      compact(
        flatMap(
          folder.pages,
          (page) => page.pageType === "CalculatedSummaryPage" && page
        )
      )
    )
  );

const getCalculatedSummary = (ctx, pageId) =>
  getAllCalculatedSummaries(ctx.questionnaireJson).find(
    (page) => page.id === pageId
  );

// Define a new function to format labels
const formatter = (label) => {
  if (label) {
    var formattedLabel = label;
    formattedLabel = formattedLabel.replace(/(<([^>]+)>)/gi, "");
    formattedLabel = formattedLabel.replace(/[^a-zA-Z0-9 ]/g, "");
    formattedLabel = formattedLabel.replace(/ /g, "_");
    return formattedLabel.toLowerCase();
  } else {
    return "untitled_answer";
  }
};

const PIPE_TYPES = {
  answers: {
    retrieve: ({ id, type }, ctx) => {
      let tempId = id.toString();
      if (type === "DateRange") {
        tempId = id.endsWith("from") ? id.slice(0, -4) : id.slice(0, -2);
      }
      return getAnswer(ctx, tempId);
    },
    render: ({ id }) => id,
    placeholder: ({ label, secondaryLabel, type, id }) => {
      // The placeholders will now be 'label' and 'secondaryLabel' values, hence different for the piped date range values.
      if (type === "DateRange") {
        return id.endsWith("from")
          ? formatter(label)
          : formatter(secondaryLabel);
      } else {
        return formatter(label);
      }
    },
    getType: ({ type }) => type,
    getFallback: ({ properties, id, type, options, advancedProperties }) => {
      if (type === "Radio" && options) {
        const dynamicOption = find(options, { dynamicAnswer: true });
        if (dynamicOption && dynamicOption.dynamicAnswerID) {
          return {
            source: "answers",
            identifier: `answer${dynamicOption.dynamicAnswerID}`,
          };
        }
      }
      if (
        type === "DateRange" &&
        advancedProperties &&
        properties &&
        properties.fallback &&
        properties.fallback.enabled
      ) {
        return {
          source: "metadata",
          identifier: id.endsWith("from")
            ? properties.fallback.start
            : properties.fallback.end,
        };
      }
      return null;
    },
  },
  metadata: {
    retrieve: ({ id }, ctx) => getMetadata(ctx, id.toString()),
    render: ({ key }) => `${key}`,
    placeholder: ({ key }) => `${key.toLowerCase()}`,
    getType: ({ type }) => type,
    getFallback: ({ fallbackKey }) =>
      fallbackKey ? { source: "metadata", identifier: fallbackKey } : null,
  },
  variable: {
    retrieve: ({ id }, ctx) => {
      return getCalculatedSummary(ctx, id.toString());
    },
    getType: ({ type }) => type,
    render: ({ id }) => id,
    placeholder: ({ totalTitle }) => formatter(totalTitle),
    getFallback: ({ fallbackKey }) =>
      fallbackKey
        ? { source: "calculated_summary", identifier: fallbackKey }
        : null,
  },
  supplementary: {
    retrieve: ({ id }, ctx) => getSuplementaryField(ctx, id),
    getType: ({ type }) => type,
    render: ({ id }) => id,
    placeholder: ({ identifier, selector }) =>
      selector
        ? formatter(identifier) + "_" + formatter(selector)
        : formatter(identifier),
    getFallback: () => null,
  },
};

const parseHTML = (html) => {
  return cheerio.load(html)("body");
};

const getPipedData = (store) => (element, ctx, conditionalTradAs) => {
  const { piped, ...elementData } = element.data();
  const pipeConfig = PIPE_TYPES[piped];

  if (piped === "variable" && element.data().id === "total") {
    return `%(total)s`;
  }

  if (!pipeConfig) {
    return "";
  }

  const entity = pipeConfig.retrieve(elementData, ctx);

  if (!entity) {
    return "";
  }

  // Extract 'label' and 'secondaryLabel' values from 'entity'
  const { label, secondaryLabel } = entity;
  // Create a new element consisting of both 'label' and 'secondaryLabel' along with 'elementData' for 'DateRange' answer types
  const dateRangeElement = { ...elementData, label, secondaryLabel };

  const placeholderName =
    elementData.type === "DateRange"
      ? pipeConfig.placeholder(dateRangeElement)
      : pipeConfig.placeholder(entity);

  const identifier =
    elementData.type === "DateRange"
      ? pipeConfig.render(elementData)
      : pipeConfig.render(entity);

  const answerType = pipeConfig.getType(entity);

  const fallback = pipeConfig.getFallback({ ...entity, ...elementData });

  let placeholder;

  let dateFormat, unitType;

  if (entity.properties) {
    dateFormat = entity.properties.format;
    unitType = entity.properties.unit;
  }

  placeholder = placeholderObjectBuilder(
    piped,
    placeholderName,
    identifier,
    dateFormat,
    unitType,
    fallback,
    answerType,
    ctx,
    conditionalTradAs
  );

  store.placeholders = [...store.placeholders, placeholder];

  return `{${removeDash(placeholderName)}}`;
};

const convertPipes = (ctx, isMultipleChoiceValue) => (html) => {
  if (!html) {
    return html;
  }

  const store = {
    text: "",
    placeholders: [],
  };

  const $ = parseHTML(html);
  const conditionalTradAs =
    $.text().includes("(trad_as)") || $.text().includes("([Trad As])");

  $.find("[data-piped]").each((index, element) => {
    const $elem = cheerio(element);
    $elem.replaceWith(getPipedData(store)($elem, ctx, conditionalTradAs));
  });

  store.text = unescapePiping($.html(), isMultipleChoiceValue);

  if (conditionalTradAs) {
    store.text = store.text.replace("({trad_as})", "{trad_as}");
  }
  
  store.text = store.text.replace(/\s+$/, '');

  if (!store.placeholders.length) {
    return store.text;
  }

  return store;
};

module.exports = convertPipes;
module.exports.getAllAnswers = getAllAnswers;
