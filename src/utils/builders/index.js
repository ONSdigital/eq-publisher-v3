const { flow } = require("lodash");
const convertPipes = require("../convertPipes");

const { getInnerHTMLWithPiping } = require("../HTMLUtils");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

const buildContents = (title, ctx) => {
  return processPipe(ctx)(title);
};

const buildIntroductionTitle = () => {
  return {
    text: "You are completing this for {trad_as} ({ru_name})",
    placeholders: [
      {
        placeholder: "trad_as",
        transforms: [
          {
            transform: "first_non_empty_item",
            arguments: {
              items: [
                {
                  source: "metadata",
                  identifier: "trad_as",
                },
                {
                  source: "metadata",
                  identifier: "ru_name",
                },
              ],
            },
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
