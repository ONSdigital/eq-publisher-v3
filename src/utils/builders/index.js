const { flow } = require("lodash");
const convertPipes = require("../convertPipes");

const { getInnerHTMLWithPiping } = require("../HTMLUtils");

const processPipe = (ctx, isMultipleChoiceValue) =>
  flow(convertPipes(ctx, isMultipleChoiceValue), getInnerHTMLWithPiping);

const buildContents = (title, ctx, isMultipleChoiceValue) => {
  return processPipe(ctx, isMultipleChoiceValue)(title);
};

const buildIntroductionTitle = () => {
  return {
    text: "You are completing this for {ru_name} {conditional_trad_as}",
    placeholders: [
      {
        placeholder: "conditional_trad_as",
        transforms: [
          {
            arguments: {
              trad_as: {
                source: "metadata",
                identifier: "trad_as",
              },
            },
            transform: "conditional_trad_as",
          },
        ],
      },
      {
        placeholder: "ru_name",
        value: {
          source: "metadata",
          identifier: "ru_name",
        },
      },
    ],
  };
};

module.exports = {
  buildContents,
  buildIntroductionTitle,
};
