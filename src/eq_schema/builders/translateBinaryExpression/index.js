const conditionConverter = require("../../../utils/convertRoutingConditions");
const { flatMap, filter } = require("lodash");

const authorConditions = {
  UNANSWERED: "Unanswered"
};

const getOptionsFromQuestionaire = (questionnaire) => {
  const pages = flatMap(questionnaire.sections, 'pages')
  const answers = flatMap(pages, 'answers')
  return flatMap(filter(answers, 'options'), 'options')
}

const getOptionValues = (optionIds, questionnaire) => {
  const options = getOptionsFromQuestionaire(questionnaire)
  return optionIds.map((id) => filter(options, { id })[0].label)
}

const buildAnswerBinaryExpression = ({ left, condition, right }, ctx) => {
  const returnVal = {
    id: `answer${left.answerId}`,
    condition: conditionConverter(condition)
  };

  if (condition === authorConditions.UNANSWERED) {
    return returnVal;
  }

  if (right.type === "SelectedOptions") {
    returnVal.values = getOptionValues(right.optionIds, ctx.questionnaireJson)
  } else {
    returnVal.value = right.customValue.number;
  }

  return returnVal;
};

const translateBinaryExpression = (binaryExpression, ctx) => {
  if (binaryExpression.left.type === "Answer") {
    return buildAnswerBinaryExpression(binaryExpression, ctx);
  } else {
    throw new Error(
      `${binaryExpression.left.type} is not a valid routing answer type`
    );
  }
};

module.exports = translateBinaryExpression;
