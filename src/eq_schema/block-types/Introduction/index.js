const { flow } = require("lodash");
const convertPipes = require("../../../utils/convertPipes");
const newPipes = require("../../../utils/convertPipes").newPipes;

const {
  parseContent,
  getInnerHTMLWithPiping
} = require("../../../utils/HTMLUtils");

// const processNewPipe = ctx => newPipes(ctx);

// const processContent = ctx => flow(newPipes(ctx), parseContent);
const processContent = ctx => flow(convertPipes(ctx), parseContent);

const getSimpleText = (content, ctx) =>
  flow(newPipes(ctx), getInnerHTMLWithPiping)(content);
const processNewPipe = (content, ctx) =>
  flow(newPipes(ctx), getInnerHTMLWithPiping)(content);

const getComplexText = (content, ctx) => {
  const result = processContent(ctx)(content)("content");

  console.log("\n\nresult = = =  :", result);

  if (result) {
    return result.content;
  }
  return undefined;
};

module.exports = class Introduction {
  constructor(
    {
      title,
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

    let primaryContent, test;

    if (description) {
      console.log("\n\ndescription - - - - :", description);

      primaryContent = getComplexText(description, ctx)[1];

      console.log("\n\nprimaryContent ========== :", primaryContent);

      // test = primaryContent.map((description, index) => {
      //   console.log("description, index :", description, index);
      //   processNewPipe(description, ctx);
      // });
    }

    this.primary_content = [
      {
        id: "primary",
        title: processNewPipe(title, ctx),
        contents: [
          {
            description: processNewPipe(description, ctx),
            ...primaryContent
          }
        ]
        // contents: getComplexText(description, ctx)
      }
    ];

    this.preview_content = {
      id: "preview",

      title: processNewPipe(secondaryTitle, ctx),
      // title: getSimpleText(secondaryTitle, ctx),

      // contents: getComplexText(secondaryDescription, ctx),
      contents: [
        {
          description: processNewPipe(secondaryDescription, ctx)
        }
      ],
      questions: collapsibles
        .filter(collapsible => collapsible.title && collapsible.description)
        .map(({ title, description }) => ({
          question: title,
          contents: [
            {
              description: processNewPipe(description, ctx)
            }
          ]
          // contents: getComplexText(description, ctx)
        }))
    };

    let tertiaryContent;

    if (tertiaryDescription) {
      console.log(
        "\n\ngetComplexText(tertiaryDescription, ctx) :",
        getComplexText(tertiaryDescription, ctx)
      );
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
