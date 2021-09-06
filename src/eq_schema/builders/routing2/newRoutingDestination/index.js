const routingConditionConversion = require("../../../../utils/routingConditionConversion");
const { flatMap, filter } = require("lodash");

const authorConditions = {
  UNANSWERED: "Unanswered",
};

const getOptionsFromQuestionaire = (questionnaire) => {
  const pages = flatMap(questionnaire.sections, (section) =>
    flatMap(section.folders, "pages")
  );
  const answers = flatMap(pages, "answers");
  return flatMap(filter(answers, "options"), "options");
};

const getOptionValues = (optionIds, questionnaire) => {
  const options = getOptionsFromQuestionaire(questionnaire);

  const optionResults = optionIds.map((id) => filter(options, { id })[0].label);

  if (optionResults === undefined || optionResults.length < 0) {
    return null;
  } else {
    return optionResults;
  }
};

const buildAnswerObject = ({ left, condition, right }, ctx) => {
  const returnVal = [
    {
      identifier: `answer${left.answerId}`,
      source: left.type,
    },
  ];

  if (right === null) {
    returnVal.push(null);

    const finalVal = { [routingConditionConversion(condition)]: returnVal };

    return finalVal;
  }

  if (right.type === "SelectedOptions") {
    const optionValues = [
      {
        identifier: `answer${left.answerId}`,
        values:
          condition !== authorConditions.UNANSWERED
            ? getOptionValues(right.optionIds, ctx.questionnaireJson)
            : null,
      },
    ];

    if (condition === "NotAnyOf") {
      const SelectedOptions = {
        [routingConditionConversion(condition)]: { "any-in": optionValues },
      };

      return SelectedOptions;
    }

    const SelectedOptions = {
      [routingConditionConversion(condition)]: optionValues,
    };

    return SelectedOptions;
  } else {
    returnVal.push(right.customValue.number);
  }

  const finalVal = { [routingConditionConversion(condition)]: returnVal };

  return finalVal;
};

const checkValidRoutingType = (expression, ctx) => {
  if (expression.left.type === "Answer") {
    return buildAnswerObject(expression, ctx);
  } else {
    throw new Error(
      `${expression.left.type} is not a valid routing answer type`
    );
  }
};

module.exports = checkValidRoutingType;
