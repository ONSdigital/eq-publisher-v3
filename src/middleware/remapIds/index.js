module.exports = (req, res, next) => {
  // Object storing IDs mapped to their page descriptions - used for referencing page descriptions
  const pageDescriptionLookupTable = {};

  res.locals.questionnaire.sections.forEach((section) => {
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
            pageDescriptionLookupTable[page.id] = page.pageDescription;
          }
          page.id = page.pageDescription;
        }
      });
    });
  });

  next();
};
