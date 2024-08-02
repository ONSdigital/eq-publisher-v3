const { getPages } = require("./pageGetters.js");
const { flatMap } = require("lodash");

const getAnswerByID = (ctx, answerId) => {
  //   console.log(answerId);
  const pages = getPages(ctx);
  //   console.log(pages);
  const answers = flatMap(pages, (page) => page.answers);
  //   console.log(answers);
  // Find the answer object by ID
  return answers.find((answer) => answer.id === answerId) || null;
};

module.exports = { getAnswerByID };
