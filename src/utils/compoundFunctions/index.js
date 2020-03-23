const { flow } = require("lodash/fp");
const { parseContent, getInnerHTMLWithPiping } = require("../HTMLUtils");
const newPipes = require("../convertPipes").newPipes;

const processPipe = ctx => flow(newPipes(ctx), getInnerHTMLWithPiping);

// Want to remove [contentType] from parseContent
// Can then apply the wrapper at this level or higher
// ---------------------------------------------------------------------------------

const wrapContents = propName => content => {
  const result = parseContent(content);
  console.log(result, "here are my results");
  if (result.length) {
    return { [propName]: result };
  }

  return undefined;
};

// ---------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------
const reversePiping = ctx => data => {
  if (!data) {
    return "";
  }
  // This works?
  // ---------------------------------------------------------------------------------
  const content = data.contents ? data.contents : data.content;
  // ---------------------------------------------------------------------------------
  //   console.log(content);
  if (content.length) {
    content.map(items => {
      //   const pipe = content.map(items => {
      if (items.list) {
        items.list = items.list.map(item => processPipe(ctx)(item));
      }
      if (items.description) {
        items.description = processPipe(ctx)(items.description);
      }
      return items;
    });
  }

  return data;
};

// ---------------------------------------------------------------------------------

// At the end of this I think I want to flow the two functions together
// ---------------------------------------------------------------------------------

module.exports = {
  wrapContents,
  reversePiping
};
