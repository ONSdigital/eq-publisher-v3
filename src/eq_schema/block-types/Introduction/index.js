const { flow } = require("lodash");
const newPipes = require("../../../utils/convertPipes").newPipes;

const {
  parseContent,
  getInnerHTMLWithPiping
} = require("../../../utils/HTMLUtils");

const processPipe = ctx => flow(newPipes(ctx), getInnerHTMLWithPiping);

const getSimpleText = (content, ctx) =>
  flow(newPipes(ctx), getInnerHTMLWithPiping)(content);
// --------------------------------------------------------------------------------------------------
const getComplexText = content => {
  const result = parseContent(content)("content");
  if (result) {
    return result.content;
  }
  return undefined;
};
// --------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------
// Hi Shane, hope you see this and don't mind that I took a good look & go at it
// It was a hassle, basically have reversed the whole idea of the way we were processing
// It's not 100% done yet and needs some tidying up
// --------------------------------------------------------------------------------------------------
// Basically in the function below, parseContent was in the wrong place
// It separated everything out and so I swapped it around and then applied the piping stuff
// const processContentNew = ctx => flow(convertPipesXXX(ctx), parseContent);
// --------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------
const reversePiping = (content, ctx) => {
  if (!content) {
    return "";
  }
  const gotthis = content.map(items => {
    if (items.list) {
      items.list = items.list.map(item => processPipe(ctx)(item));
    }
    if (items.description) {
      items.description = processPipe(ctx)(items.description);
    }
    return items;
  });
  return gotthis;
};
// --------------------------------------------------------------------------------------------------
class Introduction {
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
    this.id = "introduction-block";
    this.type = "Introduction";
    this.primary_content = [
      {
        id: "primary",
        title: this.buildTitle(title, ctx),
        // --------------------------------------------------------------------------------------------------
        contents: reversePiping(getComplexText(description), ctx)
        // --------------------------------------------------------------------------------------------------
      }
    ];
    this.preview_content = {
      id: "preview",
      title: getSimpleText(secondaryTitle, ctx),
      // --------------------------------------------------------------------------------------------------
      contents: reversePiping(getComplexText(secondaryDescription), ctx),
      // --------------------------------------------------------------------------------------------------
      questions: collapsibles
        .filter(collapsible => collapsible.title && collapsible.description)
        .map(({ title, description }) => ({
          question: getSimpleText(title, ctx),
          // --------------------------------------------------------------------------------------------------
          contents: reversePiping(getComplexText(description), ctx)
          // --------------------------------------------------------------------------------------------------
        }))
    };

    let tertiaryContent;
    if (tertiaryDescription) {
      // not sure about the need for the [0]
      // --------------------------------------------------------------------------------------------------
      tertiaryContent = reversePiping(
        getComplexText(tertiaryDescription),
        ctx
      )[0];
      // --------------------------------------------------------------------------------------------------
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
  // looking to move the build functions into here
  // --------------------------------------------------------------------------------------------------
  buildContents(description, ctx) {
    let obj = {};
    if (description) {
      // this works for question contents
      obj = processPipe(ctx)(description);
    }
    return obj;
  }

  buildTitle(title, ctx) {
    return processPipe(ctx)(title);
  }
  // --------------------------------------------------------------------------------------------------
}

module.exports = Introduction;
