const cheerio = require("cheerio");

const {
  formatPageDescription,
} = require("../../utils/functions/formatPageDescription");

module.exports = (req, res, next) => {
  // Object storing IDs mapped to their page descriptions - used for referencing page descriptions
  const pageDescriptionLookupTable = {};

  //function to remap page ids to page descriptions for variables piped in page titles 
  const convertPiping = (html) => {
    const htmldata = cheerio.load(html)("body");
    htmldata.find("[data-piped]").each((index, element) => {
      const elementData = cheerio(element);
      if (elementData.data().piped === "variable" && elementData.data().id !== "total") {
        const newId = pageDescriptionLookupTable[elementData.data().id];
        elementData.attr("data-id", newId);
      }
    });
    return htmldata.html();
  };

  // Adds all IDs to lookup table with page descriptions, and remaps IDs to page descriptions
  res.locals.questionnaire.sections.forEach((section) => {
    if (section.sectionSummary && section.sectionSummaryPageDescription) {
      section.id = formatPageDescription(section.sectionSummaryPageDescription);
    }
    section.folders.forEach((folder) => {
      folder.pages.forEach((page) => {
        if (page.pageDescription) {
          /* Adds page id with page description to lookup table if page id is not defined in lookup table
            For list collector pages, use the anotherPageDescription field to set the page id  
          */

          if (page.pageType === "ListCollectorPage") {
            if (
              !Object.prototype.hasOwnProperty.call(
                pageDescriptionLookupTable,
                page.id
              )
            ) {
              pageDescriptionLookupTable[page.id] = formatPageDescription(
                page.anotherPageDescription
              );
            }
            page.id = formatPageDescription(page.anotherPageDescription);
          } else {
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
              rule.destination.pageId &&
              pageDescriptionLookupTable[rule.destination.pageId]
            ) {
              rule.destination.pageId =
                pageDescriptionLookupTable[rule.destination.pageId];
            }
          });

          // Remaps routing `else` pageId to pageDescription if the `else` uses a pageId and the destination page has a page description
          if (
            page.routing.else.pageId &&
            pageDescriptionLookupTable[page.routing.else.pageId]
          ) {
            page.routing.else.pageId =
              pageDescriptionLookupTable[page.routing.else.pageId];
          }
        }
      });
    });
  });

  //remaps the IDs in page titles if a variable is piped in 
  res.locals.questionnaire.sections.forEach((section) => {
    section.folders.forEach((folder) => {
      folder.pages.forEach((page) => {
        if (page.title) {
          page.title = convertPiping(page.title);
        }
      });
    });
  });

  next();
};
