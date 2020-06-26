const translateBinaryExpression = require("../translateBinaryExpression");

module.exports = (authorSkipConditions, ctx) => {
  const skipConditions = authorSkipConditions.map(expressionGroup => {
    let skipCondition;
    const when = expressionGroup.expressions.map(expression =>
      translateBinaryExpression(expression, ctx)
    );
    skipCondition = { when };
    return skipCondition;
  });
  return [...skipConditions];
};
