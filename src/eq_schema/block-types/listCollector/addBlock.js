const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { flow } = require("lodash/fp");
const { remove, cloneDeep, find } = require("lodash");
const Answer = require("../../schema/Answer");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

class AddBlock {
  constructor(page, ctx) {
    this.id = `add-block-${page.id}`
    this.type = "ListAddQuestion"
    this.cancel_text = "Don’t need to add this item"
    const listAnswers = find(ctx.questionnaireJson.collectionLists.lists, { id: page.listId }).answers
    this.question = {
      id: `add-block-question-${page.id}`,
      type: "General",
      title: processPipe(ctx)(page.addItemTitle),
      page_title: `${page.addItemPageDescription} - ${ctx.questionnaireJson.title}`,
      answers: this.buildAnswers(listAnswers, ctx)
    }
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
