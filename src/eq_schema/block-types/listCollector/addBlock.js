const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { flow } = require("lodash/fp");
const { remove, cloneDeep } = require("lodash");
const Answer = require("../../schema/Answer");
const { getList } = require("../../../utils/functions/listGetters");
const {
  formatPageDescription,
} = require("../../../utils/functions/formatPageDescription");
const {
  wrapContents,
  reversePipeContent,
} = require("../../../utils/compoundFunctions");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);
const reversePipe = (ctx) =>
  flow(wrapContents("contents"), reversePipeContent(ctx));
class AddBlock {
  constructor(page, ctx) {
    this.id = `add-block-${formatPageDescription(page.pageDescription)}`;
    this.type = "ListAddQuestion";
    this.page_title = processPipe(ctx)(page.pageDescription);

    this.cancel_text = "Don’t nCDeed to add this item";
    this.question = this.buildQuestion(page, ctx);
  }

  buildQuestion(page, ctx) {
    const listAnswers = getList(ctx, page.listId).answers;
    const question = {
      id: `add-block-question-${formatPageDescription(page.pageDescription)}`,
    };
    if (page.descriptionEnabled && page.description) {
      question.description = [convertPipes(ctx)(page.description)];
    }

    if (page.guidanceEnabled && page.guidance) {
      question.guidance = reversePipe(ctx)(page.guidance);
    }

    if (
      page.definitionEnabled &&
      (page.definitionLabel || page.definitionContent)
    ) {
      question.definitions = [
        {
          title: processPipe(ctx)(page.definitionLabel),
          ...reversePipe(ctx)(page.definitionContent),
        },
      ];
    }
    question.type = "General";
    question.title = processPipe(ctx)(page.title);
    question.answers = this.buildAnswers(listAnswers, ctx);
    return question;
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
