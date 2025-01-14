const { getPages } = require("./pageGetters");
const { flatMap } = require("lodash");

const getAnswerById = (ctx, answerId) => {
  const pages = getPages(ctx);
  const answers = flatMap(pages, (page) => page.answers);

  const resultAnswer = answers.find(
    (answer) => answer && answer.id === answerId
  );

  return resultAnswer;
};

module.exports = { getAnswerById };
