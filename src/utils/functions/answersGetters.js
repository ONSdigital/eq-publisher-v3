const { getPages } = require("./pageGetters");

const getAnswerById = (ctx, answerId) => {
  let result;
  const pages = getPages(ctx);
  pages.answers.forEach((answer) => {
    if (answer.id === answerId) {
      result = answer;
    }
  });

  return result;
};

module.exports = { getAnswerById };
