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

const getSupplementaryValueSource = (ctx, sourceId) => {
  const suplementaryField = find(
    flatMap(ctx.questionnaireJson.supplementaryData.data, "schemaFields"),
    { id: sourceId }
  );

  const source = {
    source: "supplementary_data",
    identifier: suplementaryField.identifier,
  };

  if (suplementaryField.selector) {
    source.selectors = [suplementaryField.selector];
  }

  return source;
};

module.exports = {
  getValueSource,
  getSupplementaryValueSource,
};
