const { get, isNil } = require("lodash");
const { flow, getOr, last, map, some } = require("lodash/fp");

const convertPipes = require("../../../utils/convertPipes");
const newPipes = require("../../../utils/convertPipes").newPipes;

const translateAuthorRouting = require("../../builders/routing2");
const {
  getInnerHTMLWithPiping,
  unescapePiping
} = require("../../../utils/HTMLUtils");
const Question = require("../Question");

const pageTypeMappings = {
  QuestionPage: "Question",
  InterstitialPage: "Interstitial"
};

const getLastPage = flow(getOr([], "pages"), last);

const processPipedTitle = ctx =>
  flow(convertPipes(ctx), getInnerHTMLWithPiping);

const processPipedText = ctx => flow(convertPipes(ctx), unescapePiping);

const isPlaceholders = store => {
  const { placeholders, text } = store;
  if (!placeholders.length) {
    return text;
  }
  store.text = getInnerHTMLWithPiping(text);
  return store;
};
const processNewPipe = ctx => flow(newPipes(ctx), isPlaceholders);

const isLastPageInSection = (page, ctx) =>
  flow(getOr([], "sections"), map(getLastPage), some({ id: page.id }))(ctx);

class Block {
  constructor(page, groupId, ctx) {
    this.id = `block${page.id}`;
    this.type = this.convertPageType(page.pageType);
    this.buildPages(page, ctx);
    if (page.routing && isNil(page.confirmation)) {
      this.routing_rules = translateAuthorRouting(
        page.routing,
        page.id,
        groupId,
        ctx
      );
    }
  }

  static buildIntroBlock(introductionTitle, introductionContent, groupId, ctx) {
    return {
      type: "Interstitial",
      id: `group${groupId}-introduction`,
      content: {
        title: processPipedTitle(ctx)(introductionTitle) || "",
        contents: [
          {
            description: processPipedText(ctx)(introductionContent) || ""
          }
        ]
      }
    };
  }

  buildPages(page, ctx) {
    if (
      page.pageType === "QuestionPage" ||
      page.pageType === "ConfirmationQuestion"
    ) {
      this.question = new Question(page, ctx);
    }
    if (page.pageType === "CalculatedSummaryPage") {
      // this.title = processPipedTitle(ctx)(page.title);
      this.title = processNewPipe(ctx)(page.title);

      this.type = "CalculatedSummary";
      this.calculation = {
        calculation_type: "sum",
        answers_to_calculate: page.summaryAnswers.map(o => `answer${o}`),
        // title: processPipedTitle(ctx)(page.totalTitle)
        title: processNewPipe(ctx)(page.totalTitle)
      };
    }
  }

  convertPageType(type) {
    return get(pageTypeMappings, type, type);
  }
}

module.exports = Block;
module.exports.isLastPageInSection = isLastPageInSection;
