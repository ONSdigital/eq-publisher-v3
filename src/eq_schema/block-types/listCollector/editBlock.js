const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { flow } = require("lodash/fp");
const { remove, cloneDeep, find } = require("lodash");
const Answer = require("../../schema/Answer");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

class EditBlock {
  constructor(page, ctx) {
    this.id = `edit-block-${page.id}`
    this.type = "ListEditQuestion"
    this.cancel_text = "Don’t need to edit this item"
    const listAnswers = find(ctx.questionnaireJson.collectionLists.lists, { id: page.listId }).answers
    this.question = {
      id: `edit-block-question-${page.id}`,
      type: "General",
      title: processPipe(ctx)(page.addItemTitle),
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

module.exports = EditBlock;
