const { flow } = require("lodash");
const convertPipes = require("../../../utils/convertPipes");
const {
  wrapContents,
  reversePiping
} = require("../../../utils/compoundFunctions");

const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");

const processPipe = ctx => flow(convertPipes(ctx), getInnerHTMLWithPiping);

const getSimpleText = (content, ctx) =>
  flow(convertPipes(ctx), getInnerHTMLWithPiping)(content);

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
    this.secondary_content = [
      {
        id: "secondary-content",
        contents: [
          {
            title: getSimpleText(tertiaryTitle, ctx),
            // Could you let me know if this works better?
            // This does the trick!
            // ----------------------------------------------------------------------
            // Hi Shane, may need to run this by you tomorrow
            // It has an extra contents prop which my validator is saying it doesn't like
            // contents: this.buildContents(tertiaryDescription, ctx)
            // ----------------------------------------------------------------------
            // This gets rid of the contents prop - the [0] is to stop it printing that out?
            // Not sure if we are getting our wires mixed somewhere
            // ...this.buildContents(tertiaryDescription, ctx)[0]
            ...(tertiaryDescription &&
              this.buildContents(tertiaryDescription, ctx)[0])
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
