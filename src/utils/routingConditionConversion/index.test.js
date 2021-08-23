const routingConditionConversion = require(".");

describe("Convert routing conditions", () => {
  it("should convert from the author condition to the runner condition", () => {
    const conditionMap = {
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
    Object.keys(conditionMap).forEach((authorCondition) =>
      expect(routingConditionConversion(authorCondition)).toEqual(
        conditionMap[authorCondition]
      )
    );
  });

  it("should throw an error when provided an unexpected condition", () => {
    expect(() => {
      routingConditionConversion("broken");
    }).toThrow("Unsupported author condition: broken");
  });
});
