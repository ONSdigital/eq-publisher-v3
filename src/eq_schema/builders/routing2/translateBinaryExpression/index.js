const conditionConverter = require("../../../../utils/convertRoutingConditions");

const authorConditions = {
  UNANSWERED: "Unanswered"
};

const buildAnswerBinaryExpression = ({ left, condition, right }, ctx) => {
  const returnVal = {
    id: `answer${left.answerId}`,
    condition: conditionConverter(condition)
  };

  if (condition === authorConditions.UNANSWERED) {
    return returnVal;
  }

  if (right.type === "SelectedOptions") {
    // ToDo:- add lookup for option values
    returnVal.values = right.optionIds
  } else {
    returnVal.value = right.customValue.number;
  }

  return returnVal;
};

const translateBinaryExpression = ( binaryExpression, ctx ) => {
  if (binaryExpression.left.type === "Answer") {
    return buildAnswerBinaryExpression(binaryExpression, ctx);
  } else {
    throw new Error(
      `${binaryExpression.left.type} is not a valid routing answer type`
    );
  }
};

module.exports = translateBinaryExpression;
