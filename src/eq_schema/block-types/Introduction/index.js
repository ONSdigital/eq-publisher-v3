const { flow } = require("lodash");
const newPipes = require("../../../utils/convertPipes").newPipes;
const {
  wrapContents,
  reversePiping
} = require("../../../utils/compoundFunctions");

const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");

const processPipe = ctx => flow(newPipes(ctx), getInnerHTMLWithPiping);

const getSimpleText = (content, ctx) =>
  flow(newPipes(ctx), getInnerHTMLWithPiping)(content);

const reverseContent = ctx => flow(wrapContents("content"), reversePiping(ctx));

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
        contents: this.buildContents(description, ctx)
        // --------------------------------------------------------------------------------------------------
      }
    ];
    this.preview_content = {
      id: "preview",
      title: this.buildTitle(secondaryTitle, ctx),
      // --------------------------------------------------------------------------------------------------
      contents: this.buildContents(secondaryDescription, ctx),
      // --------------------------------------------------------------------------------------------------
      questions: collapsibles
        .filter(collapsible => collapsible.title && collapsible.description)
        .map(({ title, description }) => ({
          question: this.buildTitle(title, ctx),
          // --------------------------------------------------------------------------------------------------
          contents: this.buildContents(description, ctx)
          // --------------------------------------------------------------------------------------------------
        }))
    };
    // ----------------------------------------------------------------------
    // not quite sure why this doesn't work when place as ... after title???
    // ----------------------------------------------------------------------
    this.secondary_content = [
      {
        id: "secondary-content",
        contents: [
          {
            title: getSimpleText(tertiaryTitle, ctx),
            // Could you let me know if this works better?
            // ----------------------------------------------------------------------
            ...(tertiaryDescription &&
              this.buildContents(tertiaryDescription, ctx)[0])
            // ----------------------------------------------------------------------
          }
        ]
      }
    ];
  }
  // looking to move the build functions into here
  // --------------------------------------------------------------------------------------------------
  buildContents(description, ctx) {
    return reverseContent(ctx)(description).content;
  }
  // --------------------------------------------------------------------------------------------------
  buildTitle(title, ctx) {
    return processPipe(ctx)(title);
  }
  // --------------------------------------------------------------------------------------------------
}

module.exports = Introduction;
