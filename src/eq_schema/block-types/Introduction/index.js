const { flow } = require("lodash");
const convertPipes = require("../../../utils/convertPipes");
const newPipes = require("../../../utils/convertPipes").newPipes;
const convertPipesXXX = require("../../../utils/convertPipes");

const {
  parseContent,
  getInnerHTMLWithPiping
} = require("../../../utils/HTMLUtils");

// const processNewPipe = ctx => newPipes(ctx);

const getSimpleText = (content, ctx) =>
  flow(newPipes(ctx), getInnerHTMLWithPiping)(content);
const processNewPipe = (content, ctx) =>
  flow(newPipes(ctx), getInnerHTMLWithPiping)(content);

// const processContentNew = ctx => flow(newPipes(ctx), parseContent);
const processContentNew = ctx => flow(convertPipesXXX(ctx), parseContent);
const processContent = ctx => flow(convertPipes(ctx), parseContent);
// const processContent = ctx => flow(parseContent(ctx));

const getComplexText = (content, ctx) => {
  const result = processContentNew(ctx)(content)("content");

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

    let primaryContent, test2;
    let test = [];
    if (description) {
      console.log("\n\ndescription - - - - :", description);

      primaryContent = getComplexText(description, ctx);
      console.log("\n\nprimaryContent ========== :", primaryContent);

      // test2 = processNewPipe(description, ctx);
      // test2 = processNewPipe(primaryContent, ctx);
      console.log("test2 ======= ", test2);

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
            description: processNewPipe(description, ctx)
            // primaryContent
            // title: test2
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
      tertiaryContent = getComplexText(tertiaryDescription, ctx)[1];
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
