const { get, isNil, find, flatMap } = require("lodash");
const { flow, getOr, last, map, some } = require("lodash/fp");

const convertPipes = require("../../../utils/convertPipes");
const {
  formatPageDescription,
} = require("../../../utils/functions/formatPageDescription");

const {
  wrapContents,
  reversePipeContent,
} = require("../../../utils/compoundFunctions");

const translateRoutingAndSkipRules = require("../../builders/routing2");

const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { getValueSource } = require("../../builders/valueSource");

const Question = require("../Question");

const pageTypeMappings = {
  QuestionPage: "Question",
  InterstitialPage: "Interstitial",
  ListCollectorPage: "ListCollector",
  DrivingQuestionPage: "ListCollectorDrivingQuestion",
  ListCollectorQualifierPage: "ListCollectorDrivingQuestion",
};

const getLastPage = flow(getOr([], "pages"), last);

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

const reversePipe = (ctx) =>
  flow(wrapContents("contents"), reversePipeContent(ctx));

const isLastPageInSection = (page, ctx) =>
  flow(getOr([], "sections"), map(getLastPage), some({ id: page.id }))(ctx);

const getPages = (ctx) =>
  flatMap(ctx.questionnaireJson.sections, (section) =>
    flatMap(section.folders, ({ pages }) => pages)
  );
const getPageByAnswerId = (ctx, answerId) =>
  find(
    getPages(ctx),
    (page) => page.answers && some({ id: answerId }, page.answers)
  );

class Block {
  constructor(page, groupId, ctx) {
    if (page.pageType === "ListCollectorPage") {
      this.id = formatPageDescription(page.anotherPageDescription);
    } else {
      this.id = page.id;
    }
    this.type = this.convertPageType(page.pageType);
    this.buildPages(page, ctx);
    let type;
    if (page.routing && isNil(page.confirmation)) {
      type = "routing";

      this.routing_rules = translateRoutingAndSkipRules(
        page.routing,
        page.id,
        groupId,
        type,
        ctx
      );
    }
    if (page.skipConditions) {
      type = "skip";

      this.skip_conditions = translateRoutingAndSkipRules(
        page.skipConditions,
        page.id,
        groupId,
        type,
        ctx
      );
    }
  }

  static buildIntroBlock(
    introductionTitle,
    introductionContent,
    introductionPageDescription,
    ctx
  ) {
    return {
      type: "Interstitial",
      id: `${formatPageDescription(introductionPageDescription)}`,
      page_title: processPipe(ctx)(introductionPageDescription),
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
    if (page.pageType === "ListCollectorPage") {
      this.page_title = processPipe(ctx)(page.anotherPageDescription);
    } else {
      this.page_title = processPipe(ctx)(page.pageDescription);
    }
    if (page.pageType === "CalculatedSummaryPage") {
      this.title = processPipe(ctx)(page.title);
      this.page_title =
        processPipe(ctx)(page.pageDescription) || processPipe(ctx)(page.title);

      const summaryPage = getPageByAnswerId(ctx, page.summaryAnswers[0]);

      if (summaryPage && summaryPage.pageType === "CalculatedSummaryPage") {
        this.type = "GrandCalculatedSummary";
      } else {
        this.type = "CalculatedSummary";
      }

      this.calculation = {
        operation: {
          "+": page.summaryAnswers.map((answerId) =>
            getValueSource(ctx, answerId)
          ),
        },
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
