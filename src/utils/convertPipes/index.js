const cheerio = require("cheerio");
const { flatMap, includes, compact } = require("lodash");
const { unescapePiping, removeDash } = require("../HTMLUtils");

const {
  FORMAT_CURRENCY,
  FORMAT_DATE,
  FORMAT_NUMBER,
  NUMBER_TRANSFORMATION,
  DATE_TRANSFORMATION
} = require("../../constants/piping");

const getMetadata = (ctx, metadataId) =>
  ctx.questionnaireJson.metadata.find(({ id }) => id === metadataId);

const isPipeableType = answer => {
  const notPipeableDataTypes = ["TextArea", "Radio", "CheckBox"];
  return !includes(notPipeableDataTypes, answer.type);
};

const getAllAnswers = questionnaire =>
  flatMap(questionnaire.sections, section =>
    compact(flatMap(section.pages, page => page.answers))
  );

const getAnswer = (ctx, answerId) =>
  getAllAnswers(ctx.questionnaireJson)
    .filter(answer => isPipeableType(answer))
    .find(answer => answer.id === answerId);

const TRANSFORM_MAP = {
  Currency: { format: FORMAT_CURRENCY, transformKey: NUMBER_TRANSFORMATION },
  Number: { format: FORMAT_NUMBER, transformKey: NUMBER_TRANSFORMATION },
  Date: { format: FORMAT_DATE, transformKey: DATE_TRANSFORMATION },
  DateRange: { format: FORMAT_DATE, transformKey: DATE_TRANSFORMATION }
};

const transform = (dataType, value) => ({
  value,
  format: TRANSFORM_MAP[dataType].format,
  options: (source, identifier) => ({
    [TRANSFORM_MAP[dataType].transformKey]: {
      source,
      identifier
    },
    ...(dataType === "Date" && { date_format: "d MMMM yyyy" })
  })
});

const FILTER_MAP = {
  Currency: (format, value, unit = "GBP") => transform(format, value),
  Date: (format, value) => transform(format, value),
  DateRange: (format, value) => transform(format, value),
  Number: (format, value) => transform(format, value)
};

const PIPE_TYPES = {
  answers: {
    retrieve: ({ id }, ctx) => getAnswer(ctx, id.toString()),
    render: ({ id }) => `answer${id}`,
    getType: ({ type }) => type
  },
  metadata: {
    retrieve: ({ id }, ctx) => getMetadata(ctx, id.toString()),
    render: ({ key }) => `${key}`,
    getType: ({ type }) => type
  },
  variable: {
    render: () => `%(total)s`
  }
};

const parseHTML = html => {
  return cheerio.load(html)("body");
};

const getPipedData = store => (element, ctx) => {
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

  const output = pipeConfig.render(entity);
  const pipedType = pipeConfig.getType(entity);

  const transformed = FILTER_MAP[pipedType];

  const isText = transformed
    ? `${transformed(pipedType, output).value}`
    : `${output}`;

  let placeholder = {};

  if (transformed) {
    const { format, value, options } = transformed(pipedType, output);
    placeholder = {
      placeholder: removeDash(value),
      transforms: [
        {
          transform: format,
          arguments: options(piped, entity.key || `answer${entity.id}`)
        }
      ]
    };
  } else {
    placeholder = {
      placeholder: removeDash(isText),
      value: {
        source: piped,
        identifier: entity.key || `answer${entity.id}`
      }
    };
  }

  store.placeholders = [...store.placeholders, placeholder];

  return `{${removeDash(isText)}}`;
};

const convertPipes = ctx => html => {
  if (!html) {
    return html;
  }

  const store = {
    text: "",
    placeholders: []
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
