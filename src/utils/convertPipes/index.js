const cheerio = require("cheerio");
const { flatMap, includes, compact } = require("lodash");
const { unescapePiping, removeDash } = require("../HTMLUtils");

// Going to separate into another file
// once decided on better var names
// -----------------------------------------------
let formatPlaceholder = "format_";
const CURRENCY = `${formatPlaceholder}currency`;
const NUMBER = `${formatPlaceholder}number`;
const DATE = `${formatPlaceholder}date`;
const DATE_TO_FORMAT = "date_to_format";
const NUMBER_TO_FORMAT = "number";
// -----------------------------------------------

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

// Follows filter_map - used in transform()
// ------------------------------------------------------------ //
const TRANSFORM_MAP = {
  Currency: { format: CURRENCY, transformKey: NUMBER_TO_FORMAT },
  Date: { format: DATE, transformKey: DATE_TO_FORMAT },
  DateRange: { format: DATE, transformKey: DATE_TO_FORMAT },
  Number: { format: NUMBER, transformKey: NUMBER_TO_FORMAT }
};
// ------------------------------------------------------------ //

// Used to build the transformation properties
// ------------------------------------------------------------ //
const transform = (dataType, value) => ({
  value,
  format: TRANSFORM_MAP[dataType].format,
  options: (source, identifier) => ({
    [TRANSFORM_MAP[dataType].transformKey]: {
      source,
      identifier
    },
    // Conditionally add if DATE - this fixes runner error
    // Validator is missing required property
    // ------------------------------------------------------------ //
    ...(dataType === "Date" && { date_format: "d MMMM yyyy" })
    // ------------------------------------------------------------ //
  })
});
// ------------------------------------------------------------ //

const FILTER_MAP = {
  Currency: (value, unit = "GBP") => `format_currency(${value}, '${unit}')`,
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

const convertElementToPipe = ($elem, ctx) => {
  const { piped, ...elementData } = $elem.data();
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
  const dataType = pipeConfig.getType(entity);

  const filter = FILTER_MAP[dataType];
  return filter ? `${filter(output)}` : `${output}`;
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
    console.log(placeholder, "transformation");
  } else {
    placeholder = {
      placeholder: isText,
      value: {
        source: piped,
        identifier: entity.key || `answer${entity.id}`
      }
    };
  }

  store.placeholders = [...store.placeholders, placeholder];

  return `{${removeDash(isText)}}`;
};

const newPiping = ctx => html => {
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

const convertPipes = ctx => html => {
  if (!html) {
    return html;
  }

  const $ = parseHTML(html);

  $.find("[data-piped]").each((i, elem) => {
    const $elem = cheerio(elem);
    $elem.replaceWith(convertElementToPipe($elem, ctx));
  });

  return unescapePiping($.html());
};

module.exports = convertPipes;
module.exports.newPipes = newPiping;
module.exports.getAllAnswers = getAllAnswers;
