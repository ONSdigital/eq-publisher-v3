const { flow } = require("lodash");
const convertPipes = require("../convertPipes");

const { getInnerHTMLWithPiping } = require("../HTMLUtils");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

const buildContents = (title, ctx) => {
  return processPipe(ctx)(title);
};

module.exports = {
  buildContents,
};
