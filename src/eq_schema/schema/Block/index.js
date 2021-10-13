const { get, isNil } = require("lodash");
const { flow, getOr, last, map, some } = require("lodash/fp");

const convertPipes = require("../../../utils/convertPipes");
const {
  wrapContents,
  reversePipeContent,
} = require("../../../utils/compoundFunctions");

const translateAuthorRouting = require("../../builders/routing2");
const translateAuthorSkipconditions = require("../../builders/expressionGroup");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");

const Question = require("../Question");

const pageTypeMappings = {
  QuestionPage: "Question",
  InterstitialPage: "Interstitial",
};

const getLastPage = flow(getOr([], "pages"), last);

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

const reversePipe = (ctx) =>
  flow(wrapContents("contents"), reversePipeContent(ctx));

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
    if (page.skipConditions) {
      this.skip_conditions = translateAuthorSkipconditions(
        page.skipConditions,
        ctx
      );
    }
  }

  static buildIntroBlock(introductionTitle, introductionContent, groupId, ctx) {
    return {
      type: "Interstitial",
      id: `group${groupId}-introduction`,
      content: {
        title: processPipe(ctx)(introductionTitle) || "",
        contents: reversePipe(ctx)(introductionContent).contents,
      },
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
      this.title = processPipe(ctx)(page.title);
      this.type = "CalculatedSummary";
      this.calculation = {
        calculation_type: "sum",
        answers_to_calculate: page.summaryAnswers.map((o) => `answer${o}`),
        title: processPipe(ctx)(page.totalTitle),
      };
    }
  }

  convertPageType(type) {
    return get(pageTypeMappings, type, type);
  }
}

module.exports = Block;
module.exports.isLastPageInSection = isLastPageInSection;
