const { flow } = require("lodash/fp");
const { remove, cloneDeep } = require("lodash");

const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const Answer = require("../../schema/Answer");
const Question = require("../../schema/Question");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

class RepeatingBlock {
  constructor(page, ctx) {
    this.id = page.id;
    this.type = "ListRepeatingQuestion";
    this.page_title = processPipe(ctx)(page.pageDescription);
    this.question = new Question(page, ctx);
  }

  buildAnswers(answers, ctx) {
    return answers.map((answer) => {
      const tempAnswer = cloneDeep(answer);
      if (tempAnswer.options) {
        remove(tempAnswer.options, { mutuallyExclusive: true });
      }
      return new Answer(tempAnswer, ctx);
    });
  }
}

module.exports = RepeatingBlock;
