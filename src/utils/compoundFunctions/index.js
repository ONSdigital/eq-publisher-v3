const { flow } = require("lodash/fp");
const { parseContent, getInnerHTMLWithPiping } = require("../HTMLUtils");
const convertPipes = require("../convertPipes");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

const wrapContents = (propName) => (content) => {
  if (!propName || propName === "" || !content) {
    return;
  }

  const result = parseContent(content);

  if (!result) {
    return;
  }
  return { [propName]: result };
};

const reversePipeContent = (ctx) => (data) => {
  if (!data) {
    return "";
  }

  const content = data.contents ? data.contents : data.content;

  content.map((items) => {
    if (items.list) {
      items.list = items.list.map((item) => processPipe(ctx)(item));
    }
    if (items.description) {
      items.description = processPipe(ctx)(items.description);
    }
    return items;
  });

  return data;
};

module.exports = {
  wrapContents,
  reversePipeContent,
};
