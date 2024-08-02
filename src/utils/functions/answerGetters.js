const { getPages } = require("./pageGetters");
const { flatMap } = require("lodash");

const getAnswerById = (ctx, answerId) => {
  const pages = getPages(ctx);
  const answers = flatMap(pages, (page) => page.answers);

  return answers.find((answer) => answer.id === answerId);
};

module.exports = { getAnswerById };
