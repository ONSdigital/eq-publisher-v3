const { flatMap, filter } = require("lodash");

const getPages = (ctx) =>
  flatMap(ctx.questionnaireJson.sections, (section) =>
    flatMap(section.folders, ({ pages }) => pages)
  );

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

const getPagesByListId = (ctx, listId) => 
  flatMap(ctx.questionnaireJson.sections, (section) =>
    flatMap(filter(section.folders, { listId:listId }), ({ pages }) => pages)
  );

module.exports = { getPageById, getPagesByListId, getPages };
