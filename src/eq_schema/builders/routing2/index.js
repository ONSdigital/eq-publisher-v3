const translateBinaryExpression = require("../translateBinaryExpression");
const translateRoutingDestination = require("./translateRoutingDestination");
const { flatMap } = require("lodash");
const { AND } = require("../../../constants/routingOperators");

const addRuleToContext = (goto, groupId, ctx) => {
  const destinationType = Object.keys(goto);

  if (destinationType.includes("group")) {
    ctx.routingGotos.push({ groupId: `group${groupId}`, ...goto });
  }
};

module.exports = (routing, pageId, groupId, ctx) => {
  const rules = flatMap(routing.rules, (rule) => {
    let runnerRules;

    const destination = translateRoutingDestination(
      rule.destination,
      pageId,
      ctx
    );

    if (rule.expressionGroup.operator === AND) {
      const when = rule.expressionGroup.expressions.map((expression) =>
        translateBinaryExpression(expression, ctx)
      );
      runnerRules = [
        {
          ...destination,
          when,
        },
      ];
    } else {
      runnerRules = rule.expressionGroup.expressions.map((expression) => {
        return {
          ...destination,
          when: [translateBinaryExpression(expression, ctx)],
        };
      });
    }
    runnerRules.map((expression) => {
      addRuleToContext(expression, groupId, ctx);
    });

    return runnerRules;
  });

  const destination = translateRoutingDestination(routing.else, pageId, ctx);

  return [...rules, { ...destination }];
};
