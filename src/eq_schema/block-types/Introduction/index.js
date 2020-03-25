const { flow } = require("lodash");
const convertPipes = require("../../../utils/convertPipes");
const {
  wrapContents,
  reversePiping
} = require("../../../utils/compoundFunctions");

const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");

const processPipe = ctx => flow(convertPipes(ctx), getInnerHTMLWithPiping);

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
        contents: this.buildContents(description, ctx)
      }
    ];
    this.preview_content = {
      id: "preview",
      title: this.buildTitle(secondaryTitle, ctx),
      contents: this.buildContents(secondaryDescription, ctx),
      questions: collapsibles
        .filter(collapsible => collapsible.title && collapsible.description)
        .map(({ title, description }) => ({
          question: this.buildTitle(title, ctx),
          contents: this.buildContents(description, ctx)
        }))
    };

    this.secondary_content = [
      {
        id: "secondary-content",
        contents: [
          {
            title: this.buildTitle(tertiaryTitle, ctx)
          },
          ...(tertiaryDescription &&
            this.buildContents(tertiaryDescription, ctx))
        ]
      }
    ];
  }

  buildContents(description, ctx) {
    return reverseContent(ctx)(description).content;
  }
  buildTitle(title, ctx) {
    return processPipe(ctx)(title);
  }
}

module.exports = Introduction;
