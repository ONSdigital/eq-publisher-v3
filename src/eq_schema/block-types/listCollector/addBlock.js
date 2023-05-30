const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { flow } = require("lodash/fp");
const { remove, cloneDeep } = require("lodash");
const Answer = require("../../schema/Answer");
const { getList } = require("../../../utils/functions/listGetters");
const {
  formatPageDescription,
} = require("../../../utils/functions/formatPageDescription");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

class AddBlock {
  constructor(page, ctx) {
    this.id = `add-block-${formatPageDescription(page.addItemPageDescription)}`;
    this.type = "ListAddQuestion";
    this.page_title = page.addItemPageDescription;
    this.cancel_text = "Don’t need to add this item";
    const listAnswers = getList(ctx, page.listId).answers;
    this.question = {
      id: `add-block-question-${formatPageDescription(
        page.addItemPageDescription
      )}`,
      type: "General",
      title: processPipe(ctx)(page.addItemTitle),
      answers: this.buildAnswers(listAnswers, ctx),
    };
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

module.exports = AddBlock;
