const cheerio = require("cheerio");
const { flatMap, includes, compact } = require("lodash");
const { unescapePiping, removeDash } = require("../HTMLUtils");
const { buildStructure } = require("./transform");

const getMetadata = (ctx, metadataId) =>
  ctx.questionnaireJson.metadata.find(({ id }) => id === metadataId);

const isPipeableType = (answer) => {
  const notPipeableAnswerTypes = ["TextArea", "Radio", "CheckBox"];
  return !includes(notPipeableAnswerTypes, answer.type);
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

const FILTER_MAP = {
  Currency: (format, value) => buildStructure(format, value),
  Date: (format, value) => buildStructure(format, value),
  DateRange: (format, value) => buildStructure(format, value),
  Number: (format, value) => buildStructure(format, value),
  Unit: (format, value) => buildStructure(format, value),
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
    render: ({ id }) => `answer${id}`,
    getType: ({ type }) => type,
    getFallback: ({
      properties: { fallback: { enabled, start, end } = {} } = {},
    }) => (enabled ? { from: start, to: end } : null),
  },
  metadata: {
    retrieve: ({ id }, ctx) => getMetadata(ctx, id.toString()),
    render: ({ key }) => `${key}`,
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

  const pipedType = pipeConfig.getType(entity);

  const transformed = FILTER_MAP[pipedType];

  const placeHolderText = transformed
    ? `${transformed(pipedType, output).value}`
    : `${output}`;

  let placeholder = {};

  if (transformed) {
    let dateFormat, unitType;

    if (entity.properties) {
      dateFormat = entity.properties.format;
      unitType = entity.properties.unit;
    }

    const fallback = pipeConfig.getFallback(entity);

    const { value, transforms } = transformed(pipedType, output);

    placeholder = {
      placeholder: removeDash(value),
      transforms: transforms(
        piped,
        entity.key || output,
        dateFormat,
        unitType,
        fallback
      ),
    };
  } else {
    placeholder = {
      placeholder: removeDash(placeHolderText),
      value: {
        source: piped,
        identifier: entity.key || output,
      },
    };
  }

  store.placeholders = [...store.placeholders, placeholder];

  return `{${removeDash(placeHolderText)}}`;
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
