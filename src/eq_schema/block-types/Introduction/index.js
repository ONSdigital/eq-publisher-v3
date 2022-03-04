const { flow } = require("lodash");
const convertPipes = require("../../../utils/convertPipes");
const {
  wrapContents,
  reversePipeContent,
} = require("../../../utils/compoundFunctions");

const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

const reverseContent = (ctx) =>
  flow(wrapContents("content"), reversePipeContent(ctx));

const buildContactDetails = require("../../builders/contactDetails");
const { buildIntroductionTitle } = require("../../../utils/builders");

class Introduction {
  constructor(
    {
      contactDetailsPhoneNumber,
      contactDetailsEmailAddress,
      contactDetailsEmailSubject,
      contactDetailsIncludeRuRef,
      description,
      secondaryTitle,
      secondaryDescription,
      additionalGuidancePanel,
      collapsibles,
      tertiaryTitle,
      tertiaryDescription,
    },
    ctx
  ) {
    this.id = "introduction-block";
    this.type = "Introduction";
    this.primary_content = []
    this.primary_content.push(
      {
        id: "primary",
        title: buildIntroductionTitle(),
        contents: buildContactDetails(
          contactDetailsPhoneNumber,
          contactDetailsEmailAddress,
          contactDetailsEmailSubject,
          contactDetailsIncludeRuRef
        ),
      }
    );
    if(additionalGuidancePanel) {
      this.primary_content.push(
        {
          id: "additional_guidance",
          contents: {
            guidance: {
              contents: this.buildContents(additionalGuidancePanel, ctx),
            },
          },
        }
      );
    }
    this.primary_content.push(
      {
        id: "description",
        contents: this.buildContents(description, ctx),
      },
    );
    this.preview_content = {
      id: "preview",
      title: this.buildTitle(secondaryTitle, ctx),
      contents: this.buildContents(secondaryDescription, ctx),
      questions: collapsibles
        .filter((collapsible) => collapsible.title && collapsible.description)
        .map(({ title, description }) => ({
          question: this.buildTitle(title, ctx),
          contents: this.buildContents(description, ctx),
        })),
    };
    if (tertiaryTitle || tertiaryDescription) {
      this.secondary_content = [
        {
          id: "secondary-content",
          contents: [
            {
              title: this.buildTitle(tertiaryTitle, ctx) || "",
            },
          ],
        },
      ];
      if (tertiaryDescription) {
        const mergeContents = [
          ...this.secondary_content[0].contents,
          ...this.buildContents(tertiaryDescription, ctx),
        ];
        this.secondary_content[0].contents = mergeContents;
      }
    }
  }

  buildContents(description, ctx) {
    return reverseContent(ctx)(description).content;
  }
  buildTitle(title, ctx) {
    return processPipe(ctx)(title);
  }
}

module.exports = Introduction;
