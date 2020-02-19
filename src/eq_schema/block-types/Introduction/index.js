const { flow } = require("lodash");
const convertPipes = require("../../../utils/convertPipes");
const {
  parseContent,
  getInnerHTMLWithPiping
} = require("../../../utils/HTMLUtils");

const processContent = ctx => flow(convertPipes(ctx), parseContent);

const getSimpleText = (content, ctx) =>
  flow(convertPipes(ctx), getInnerHTMLWithPiping)(content);

const getComplexText = (content, ctx) => {
  const result = processContent(ctx)(content);
  if (result) {
    return result.content;
  }
  return undefined;
};

module.exports = class Introduction {
  constructor(
    {
      description,
      secondaryTitle,
      secondaryDescription,
      collapsibles,
      tertiaryDescription
    },
    ctx
  ) {
    this.type = "Introduction";
    this.id = "introduction-block";

    this.primary_content = [
      {
        id: "primary",
        contents: getComplexText(description, ctx)
      }
    ];

    this.preview_content = {
      id: "preview",
      title: getSimpleText(secondaryTitle, ctx),
      contents: getComplexText(secondaryDescription, ctx),
      questions: collapsibles
        .filter(collapsible => collapsible.title && collapsible.description)
        .map(({ title, description }) => ({
          question: title,
          content: getComplexText(description, ctx)
        }))
    };

    this.secondary_content = [
      {
        id: "secondary-content",
        contents: getComplexText(tertiaryDescription, ctx)
      }
    ];
  }
};
