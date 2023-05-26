const {
  formatPageDescription,
} = require("../../utils/functions/formatPageDescription");

module.exports = (req, res, next) => {
  // Object storing IDs mapped to their page descriptions - used for referencing page descriptions
  const pageDescriptionLookupTable = {};

  // Adds all IDs to lookup table with page descriptions, and remaps IDs to page descriptions
  res.locals.questionnaire.sections.forEach((section) => {
    if (section.sectionSummary && section.sectionSummaryPageDescription) {
      section.id = formatPageDescription(section.sectionSummaryPageDescription);
    }
    section.folders.forEach((folder) => {
      folder.pages.forEach((page) => {
        if (page.pageDescription) {
          // Adds page id with page description to lookup table if page id is not defined in lookup table
          if (
            !Object.prototype.hasOwnProperty.call(
              pageDescriptionLookupTable,
              page.id
            )
          ) {
            pageDescriptionLookupTable[page.id] = formatPageDescription(
              page.pageDescription
            );
          }
          page.id = formatPageDescription(page.pageDescription);
        }

        if (page.confirmation && page.confirmation.pageDescription) {
          page.confirmation.id = formatPageDescription(
            page.confirmation.pageDescription
          );
        }
      });
    });
  });

  // Uses populated lookup table to remap IDs used in routing rules
  res.locals.questionnaire.sections.forEach((section) => {
    section.folders.forEach((folder) => {
      folder.pages.forEach((page) => {
        if (page.routing) {
          // Remaps routing rule destination pageIds to pageDescription if the destination uses a pageId and the destination page has a page description
          page.routing.rules.forEach((rule) => {
            if (
              rule.destination.id &&
              pageDescriptionLookupTable[rule.destination.id]
            ) {
              rule.destination.id =
                pageDescriptionLookupTable[rule.destination.id];
            }
          });

          // Remaps routing `else` pageId to pageDescription if the `else` uses a pageId and the destination page has a page description
          if (
            page.routing.else.id &&
            pageDescriptionLookupTable[page.routing.else.id]
          ) {
            page.routing.else.id =
              pageDescriptionLookupTable[page.routing.else.id];
          }
        }
      });
    });
  });

  next();
};
