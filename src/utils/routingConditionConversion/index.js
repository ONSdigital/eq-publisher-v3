const routingConditionConversions = {
  Equal: "==",
  NotEqual: "!=",
  GreaterThan: ">",
  LessThan: "<",
  GreaterOrEqual: ">=",
  LessOrEqual: "<=",
  AllOf: "contains all",
  AnyOf: "contains any",
  NotAnyOf: "not contains any",
  Unanswered: "not set",
  OneOf: "equals any",
};

const routingConditionConversion = (conditionString) => {
  const routingConditionString = routingConditionConversions[conditionString];
  if (!routingConditionString) {
    throw new Error(`Unsupported author condition: ${conditionString}`);
  }
  return routingConditionString;
};
module.exports = routingConditionConversion;
