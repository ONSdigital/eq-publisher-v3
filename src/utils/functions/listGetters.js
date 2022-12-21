const { find } = require("lodash");

const getList = (ctx, listId) => find(
  ctx.questionnaireJson.collectionLists.lists,
  { id: listId },
)

module.exports = { getList }
