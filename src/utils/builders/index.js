const { flow } = require("lodash");
const convertPipes = require("../convertPipes");

const { getInnerHTMLWithPiping } = require("../HTMLUtils");

const processPipe = (ctx, isMultipleChoiceValue, isRepeatingSection = false) =>
  flow(
    convertPipes(ctx, isMultipleChoiceValue, isRepeatingSection),
    getInnerHTMLWithPiping
  );

const buildContents = (
  title,
  ctx,
  isMultipleChoiceValue,
  isRepeatingSection = false
) => {
  return processPipe(ctx, isMultipleChoiceValue, isRepeatingSection)(title);
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

const formatListNames = (questionnaire) => {
  questionnaire.collectionLists.lists.forEach((list) => {
    list.listName = list.listName.replace(/ /g, "_");
    list.listName = list.listName.replace(/-/g, "_");
    list.listName = list.listName.toLowerCase();
  });
};

module.exports = {
  buildContents,
  buildIntroductionTitle,
  formatListNames,
};
