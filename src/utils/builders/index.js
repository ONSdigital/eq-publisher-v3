const { flow } = require("lodash");
const convertPipes = require("../convertPipes");
// const { wrapContents, reversePipeContent } = require("../compoundFunctions");

const { getInnerHTMLWithPiping } = require("../HTMLUtils");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

// const reverseContent = (ctx) =>
//   flow(wrapContents("content"), reversePipeContent(ctx));

// const buildContents = (description, ctx) => {
//   return reverseContent(ctx)(description).content;
// };

const buildContents = (title, ctx) => {
  return processPipe(ctx)(title);
};

module.exports = {
  buildContents,
  //   buildTitle,
};
