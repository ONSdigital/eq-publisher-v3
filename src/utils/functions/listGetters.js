const { find } = require("lodash");

const getList = (ctx, listId) => find(
  ctx.questionnaireJson.collectionLists.lists,
  { id: listId },
)

const getSupplementaryList = (ctx, listId) => find(
  ctx.questionnaireJson.supplementaryData.data,
  { id: listId },
)

const getListFromAll = (ctx, listId) => getList(ctx, listId) || getSupplementaryList(ctx, listId)

module.exports = { getList, getSupplementaryList, getListFromAll }
