const { flow } = require("lodash");
const convertPipes = require("../../../utils/convertPipes");
const {
  wrapContents,
  reversePipeContent,
} = require("../../../utils/compoundFunctions");

const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");

const processPipe = (ctx, isRepeatingSection) => flow(convertPipes(ctx, false, isRepeatingSection), getInnerHTMLWithPiping);

const reverseContent = (ctx, isRepeatingSection) =>
  flow(wrapContents("content"), reversePipeContent(ctx, false, isRepeatingSection));

const buildContactDetails = require("../../builders/contactDetails");

class Introduction {
  constructor(
    {
      title,
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
    const isRepeatingSection = ["066", "076"].includes(ctx.questionnaireJson.surveyId);
    this.id = "introduction";
    this.type = "Introduction";
    this.primary_content = [];
    this.primary_content.push({
      id: "primary",
      title: processPipe(ctx, isRepeatingSection)(title),
      contents: buildContactDetails(
        contactDetailsPhoneNumber,
        contactDetailsEmailAddress,
        contactDetailsEmailSubject,
        contactDetailsIncludeRuRef
      ),
    });
    if (additionalGuidancePanel) {
      this.primary_content.push({
        id: "additional-guidance",
        contents: [
          {
            guidance: {
              contents: this.buildContents(additionalGuidancePanel, ctx, isRepeatingSection),
            },
          },
        ],
      });
    }
    this.primary_content.push({
      id: "description",
      contents: this.buildContents(description, ctx, isRepeatingSection),
    });
    this.preview_content = {
      id: "preview",
      title: this.buildTitle(secondaryTitle, ctx, isRepeatingSection),
      contents: this.buildContents(secondaryDescription, ctx, isRepeatingSection),
      questions: collapsibles
        .filter((collapsible) => collapsible.title && collapsible.description)
        .map(({ title, description }) => ({
          question: this.buildTitle(title, ctx, isRepeatingSection),
          contents: this.buildContents(description, ctx, isRepeatingSection),
        })),
    };
    if (tertiaryTitle || tertiaryDescription) {
      this.secondary_content = [
        {
          id: "secondary-content",
          contents: [
            {
              title: this.buildTitle(tertiaryTitle, ctx, isRepeatingSection) || "",
            },
          ],
        },
      ];
      if (tertiaryDescription) {
        const mergeContents = [
          ...this.secondary_content[0].contents,
          ...this.buildContents(tertiaryDescription, ctx, isRepeatingSection),
        ];
        this.secondary_content[0].contents = mergeContents;
      }
    }
  }

  buildContents(description, ctx, isRepeatingSection) {
    return reverseContent(ctx, isRepeatingSection)(description).content;
  }
  buildTitle(title, ctx, isRepeatingSection) {
    return processPipe(ctx, isRepeatingSection)(title);
  }
}

module.exports = Introduction;
