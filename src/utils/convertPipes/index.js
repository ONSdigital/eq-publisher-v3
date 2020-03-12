const cheerio = require("cheerio");
const { flatMap, includes, compact } = require("lodash");
const { flow } = require("lodash/fp");
const { unescapePiping } = require("../HTMLUtils");

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

const FILTER_MAP = {
  Number: value => `${value} | format_number`,
  Currency: (value, unit = "GBP") => `format_currency(${value}, '${unit}')`,
  Date: value => `${value} | format_date`,
  DateRange: value => `${value} | format_date`
};

const PIPE_TYPES = {
  answers: {
    retrieve: ({ id }, ctx) => getAnswer(ctx, id.toString()),
    render: ({ id }) => `answers['answer${id}']`,
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
  // console.log(entity);
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

const findData = place => (element, ctx) => {
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
  const dataType = pipeConfig.getType(entity);

  const filter = FILTER_MAP[dataType];
  const isText = filter ? `{${filter(output)}}` : `{${output}}`;

  const placeholder = {
    placeholder: isText,
    value: {
      source: piped,
      identifier: entity.key
    }
  };
  console.log(placeholder.value);
  place.placeholders = [...place.placeholders, placeholder];

  return `${isText}`;
};

const newPiping = ctx => html => {
  if (!html) {
    return html;
  }

  const place = {
    text: "",
    placeholders: []
  };

  const $ = parseHTML(html);

  $.find("[data-piped]").each((index, element) => {
    const $elem = cheerio(element);
    $elem.replaceWith(findData(place)($elem, ctx));
  });

  place.text = unescapePiping($.html());
  return place;
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
