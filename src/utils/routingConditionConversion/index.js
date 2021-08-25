const routingConditionConversions = {
  Equal: "==",
  NotEqual: "!=",
  GreaterThan: ">",
  LessThan: "<",
  GreaterOrEqual: ">=",
  LessOrEqual: "<=",
  AllOf: "all-in",
  AnyOf: "any-in",
  NotAnyOf: "not contains any", //any-in maybe?
  Unanswered: "not set", // what do we put here
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
