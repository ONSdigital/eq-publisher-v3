const routingConditionConversions = {
  Equal: "==",
  NotEqual: "!=",
  GreaterThan: ">",
  LessThan: "<",
  GreaterOrEqual: ">=",
  LessOrEqual: "<=",
  AllOf: "all-in",
  AnyOf: "any-in",
  NotAnyOf: "not",
  Unanswered: "==",
  OneOf: "any-in",
};

const routingConditionConversion = (conditionString) => {
  const routingConditionString = routingConditionConversions[conditionString];
  if (!routingConditionString) {
    throw new Error(`Unsupported author condition: ${conditionString}`);
  }
  return routingConditionString;
};
module.exports = routingConditionConversion;
