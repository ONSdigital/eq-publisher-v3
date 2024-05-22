const { flatMap, find, some } = require("lodash");

const getPages = (ctx) =>
  flatMap(ctx.questionnaireJson.sections, (section) =>
    flatMap(section.folders, ({ pages }) => pages)
  );

const getPageByAnswerId = (ctx, answerId) =>
  find(
    getPages(ctx),
    (page) => page.answers && some(page.answers, { id: answerId })
  );

const getValueSource = (ctx, sourceId) => {
  const page = getPageByAnswerId(ctx, sourceId);
  if (page && page.pageType === "CalculatedSummaryPage") {
    const calcSumAnswers = flatMap(page.summaryAnswers, (answerId) =>
      getPageByAnswerId(ctx, answerId)
    );
    if (some(calcSumAnswers, { pageType: "CalculatedSummaryPage" })) {
      return {
        identifier: page.id,
        source: "grand_calculated_summary",
      };
    }
    return {
      identifier: page.id,
      source: "calculated_summary",
    };
  }
  return {
    identifier: `answer${sourceId}`,
    source: "answers",
  };
};

const getSupplementaryValueSource = (supplementaryField) => {
  const source = {
    source: "supplementary_data",
    identifier: supplementaryField.identifier,
  };

  if (supplementaryField.selector) {
    source.selectors = [supplementaryField.selector];
  }

  return source;
};

module.exports = {
  getValueSource,
  getSupplementaryValueSource,
};
