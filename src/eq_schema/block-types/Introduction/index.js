const { flow } = require("lodash");
const convertPipes = require("../../../utils/convertPipes");
// const newPipes = require("../../../utils/convertPipes").newPipes;

const {
  parseContent,
  getInnerHTMLWithPiping
} = require("../../../utils/HTMLUtils");

// const processNewPipe = ctx => newPipes(ctx);

// const processContent = ctx => flow(newPipes(ctx), parseContent);
const processContent = ctx => flow(convertPipes(ctx), parseContent);

// const getSimpleText = (content, ctx) =>
//   flow(newPipes(ctx), getInnerHTMLWithPiping)(content);
const getSimpleText = (content, ctx) =>
  flow(convertPipes(ctx), getInnerHTMLWithPiping)(content);

const getComplexText = (content, ctx) => {
  const result = processContent(ctx)(content)("content");
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
      tertiaryTitle,
      tertiaryDescription
    },
    ctx
  ) {
    console.log("ctx  - - - - - - :", ctx);

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

      // title: processNewPipe(secondaryTitle, ctx),
      title: getSimpleText(secondaryTitle, ctx),

      contents: getComplexText(secondaryDescription, ctx),
      questions: collapsibles
        .filter(collapsible => collapsible.title && collapsible.description)
        .map(({ title, description }) => ({
          question: title,
          // contents: processNewPipe(description, ctx)
          contents: getComplexText(description, ctx)
        }))
    };

    console.log("this.preview_content :", this.preview_content);

    let tertiaryContent;

    if (tertiaryDescription) {
      tertiaryContent = getComplexText(tertiaryDescription, ctx)[0];
    }
    this.secondary_content = [
      {
        id: "secondary-content",
        contents: [
          {
            title: getSimpleText(tertiaryTitle, ctx),
            ...tertiaryContent
          }
        ]
      }
    ];
  }
};
