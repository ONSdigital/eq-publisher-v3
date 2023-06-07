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
  if (page) {
    if (page.pageType === "CalculatedSummaryPage") {
      return {
        identifier: page.id,
        source: "calculated_summary",
      };
    }
  }
  return {
    identifier: `answer${sourceId}`,
    source: "answers",
  };
};

module.exports = {
  getValueSource,
};
