const getPageById = (ctx, pageId) => {
  let result;
  ctx.questionnaireJson.sections.forEach((section) => {
    section.folders.forEach((folder) => {
      folder.pages.forEach((page) => {
        if (page.id === pageId) {
          result = page;
        }
      });
    });
  });

  return result;
};

module.exports = { getPageById };
