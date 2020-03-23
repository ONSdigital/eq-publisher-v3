const { get, isNil } = require("lodash");
const { flow, getOr, last, map, some } = require("lodash/fp");

const newPipes = require("../../../utils/convertPipes").newPipes;

const translateAuthorRouting = require("../../builders/routing2");
const {
  parseContent,
  getInnerHTMLWithPiping
} = require("../../../utils/HTMLUtils");
const Question = require("../Question");

const pageTypeMappings = {
  QuestionPage: "Question",
  InterstitialPage: "Interstitial"
};

const getLastPage = flow(getOr([], "pages"), last);

const processNewPipe = ctx => flow(newPipes(ctx), getInnerHTMLWithPiping);

const isLastPageInSection = (page, ctx) =>
  flow(getOr([], "sections"), map(getLastPage), some({ id: page.id }))(ctx);

const getComplexText = content => {
  const result = parseContent(content)("content");
  if (result) {
    return result.content;
  }
  return undefined;
};
const reversePiping = (content, ctx) => {
  if (!content) {
    return "";
  }
  const gotthis = content.map(items => {
    if (items.list) {
      items.list = items.list.map(item => processNewPipe(ctx)(item));
    }
    if (items.description) {
      items.description = processNewPipe(ctx)(items.description);
    }
    return items;
  });
  return gotthis;
};

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
        title: processNewPipe(ctx)(introductionTitle) || "",
        contents: reversePiping(getComplexText(introductionContent), ctx)
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
      this.title = processNewPipe(ctx)(page.title);
      this.type = "CalculatedSummary";
      this.calculation = {
        calculation_type: "sum",
        answers_to_calculate: page.summaryAnswers.map(o => `answer${o}`),
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
