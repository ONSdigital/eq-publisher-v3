const cheerio = require("cheerio");
const { flatMap, includes, compact } = require("lodash");
const { unescapePiping, removeDash } = require("../HTMLUtils");
const { placeholderObjectBuilder } = require("./PlaceholderObjectBuilder");

const getMetadata = (ctx, metadataId) =>
  ctx.questionnaireJson.metadata.find(({ id }) => id === metadataId);

const isPipeableType = (answer) => {
  const notPipeableAnswerTypes = ["TextArea", "CheckBox"];
  const { type } = answer;
  return !includes(notPipeableAnswerTypes, type);
};

const getAllAnswers = (questionnaire) =>
  flatMap(questionnaire.sections, (section) =>
    flatMap(section.folders, (folder) =>
      compact(flatMap(folder.pages, (page) => page.answers))
    )
  );

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

const PIPE_TYPES = {
  answers: {
    retrieve: ({ id, type }, ctx) => {
      let tempId = id.toString();
      if (type === "DateRange") {
        tempId = id.endsWith("from") ? id.slice(0, -4) : id.slice(0, -2);
      }
      return getAnswer(ctx, tempId);
    },
    render: ({ id }) => `answer${id}`,
    getType: ({ type }) => type,
    getFallback: ({ properties, id, type, advancedProperties }) => {
      if (!(type === "DateRange") || !advancedProperties) {
        return null;
      }
      if (!properties || !properties.fallback || !properties.fallback.enabled) {
        return null;
      }
      return {
        source: "metadata",
        identifier: id.endsWith("from")
          ? properties.fallback.start
          : properties.fallback.end,
      };
    },
  },
  metadata: {
    retrieve: ({ id }, ctx) => getMetadata(ctx, id.toString()),
    render: ({ key }) => `${key}`,
    getType: ({ type }) => type,
    getFallback: ({ fallbackKey }) =>
      fallbackKey ? { source: "metadata", identifier: fallbackKey } : null,
  },
  variable: {
    retrieve: ({ id }, ctx) => {
      return getCalculatedSummary(ctx, id);
    },
    getType: ({ type }) => type,
    render: ({ id }) => `block${id}`,
    getFallback: ({ fallbackKey }) =>
      fallbackKey ? { source: "calculated_summary", identifier: fallbackKey } : null,
  },
};

const parseHTML = (html) => {
  return cheerio.load(html)("body");
};

const getPipedData = (store) => (element, ctx) => {
  const { piped, ...elementData } = element.data();
  const pipeConfig = PIPE_TYPES[piped];

  if (piped === "variable" && element.data().id === "total") {
    return `%(total)s`
  }

  if (!pipeConfig) {
    return "";
  }

  const entity = pipeConfig.retrieve(elementData, ctx);

  console.log('entity :>> ', entity);

  if (!entity) {
    return "";
  }

  const output =
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
    entity.key || output,
    dateFormat,
    unitType,
    fallback,
    answerType
  );

  console.log('placeholder :>> ', placeholder);

  store.placeholders = [...store.placeholders, placeholder];

  return `{${removeDash(output)}}`;
};

const convertPipes = (ctx) => (html) => {
  if (!html) {
    return html;
  }

  const store = {
    text: "",
    placeholders: [],
  };

  const $ = parseHTML(html);

  $.find("[data-piped]").each((index, element) => {
    const $elem = cheerio(element);
    $elem.replaceWith(getPipedData(store)($elem, ctx));
  });

  store.text = unescapePiping($.html());

  if (!store.placeholders.length) {
    return store.text;
  }

  return store;
};

module.exports = convertPipes;
module.exports.getAllAnswers = getAllAnswers;
