const cheerio = require("cheerio");
const { flatMap, includes, compact } = require("lodash");
const { unescapePiping, removeDash } = require("../HTMLUtils");
const { transformArrayBuilder } = require("./TransformArrayBuilder");

const getMetadata = (ctx, metadataId) =>
  ctx.questionnaireJson.metadata.find(({ id }) => id === metadataId);

const isPipeableType = (answer) => {
  const notPipeableAnswerTypes = ["TextArea", "Radio", "CheckBox"];
  const { type } = answer;
  return !includes(notPipeableAnswerTypes, type);
};

const getAllAnswers = (questionnaire) =>
  flatMap(questionnaire.sections, (section) =>
    flatMap(section.folders, (folder) =>
      compact(flatMap(folder.pages, (page) => page.answers))
    )
  );
const transformTypes = [
  "Currency",
  "Date",
  "DateRange",
  "Number",
  "Unit",
  "Text",
  "Text_Optional",
];

const answerThatCanBeTransformed = (answerType) =>
  transformTypes.some((e) => e.includes(answerType));

const getAnswer = (ctx, answerId) =>
  getAllAnswers(ctx.questionnaireJson)
    .filter((answer) => isPipeableType(answer))
    .find((answer) => answer.id === answerId);

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
    getFallback: ({
      properties: { fallback: { enabled, start, end } = {} } = {},
    }) => (enabled ? { from: start, to: end } : null),
  },
  metadata: {
    retrieve: ({ id }, ctx) => getMetadata(ctx, id.toString()),
    render: ({ key, fallbackKey }) =>
      fallbackKey ? `${fallbackKey}` : `${key}`,
    getType: ({ type }) => type,
  },
  variable: {
    render: () => `%(total)s`,
  },
};

const parseHTML = (html) => {
  return cheerio.load(html)("body");
};

const getPipedData = (store) => (element, ctx) => {
  const { piped, ...elementData } = element.data();
  const pipeConfig = PIPE_TYPES[piped];

  if (piped === "variable") {
    return pipeConfig.render();
  }
  if (!pipeConfig) {
    return "";
  }

  const entity = pipeConfig.retrieve(elementData, ctx);

  if (!entity) {
    return "";
  }

  const output =
    elementData.type === "DateRange"
      ? pipeConfig.render(elementData)
      : pipeConfig.render(entity);

  const answerType = pipeConfig.getType(entity);

  const canBePiped = answerThatCanBeTransformed(answerType);

  let placeholder = {};

  if (canBePiped) {
    let dateFormat, unitType;

    if (entity.properties) {
      dateFormat = entity.properties.format;
      unitType = entity.properties.unit;
    }

    const fallbackKey = output;

    const fallback =
      piped === "answers" ? pipeConfig.getFallback(entity) : null;

    placeholder = {
      placeholder: removeDash(output),
      transforms: transformArrayBuilder(
        piped,
        entity.key || output,
        dateFormat,
        unitType,
        fallback,
        fallbackKey,
        answerType
      ),
    };
  } else {
    placeholder = {
      placeholder: removeDash(output),
      value: {
        source: piped,
        identifier: entity.key || output,
      },
    };
  }

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
