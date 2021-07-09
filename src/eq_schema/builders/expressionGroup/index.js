const translateBinaryExpression = require("../translateBinaryExpression");

module.exports = (aExpressionGroups, ctx) => {
  const rExpressionGroups = aExpressionGroups.map((aExpressionGroup) => {
    let rExpressionGroup;
    const when = aExpressionGroup.expressions.map((expression) =>
      translateBinaryExpression(expression, ctx)
    );
    rExpressionGroup = { when };
    return rExpressionGroup;
  });
  return [...rExpressionGroups];
};
