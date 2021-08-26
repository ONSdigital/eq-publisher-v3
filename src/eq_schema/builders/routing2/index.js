const checkValidRoutingType = require("./newRoutingDestination");
const translateRoutingDestination = require("./translateRoutingDestination");
const { flatMap } = require("lodash");
const { AND, OR, NOT } = require("../../../constants/routingOperators");

//TODO: Duplication of some code here
const addRuleToContext = (goto, groupId, ctx) => {
  const destinationType = Object.keys(goto);

  if (destinationType.includes("group")) {
    ctx.routingGotos.push({ groupId: `group${groupId}`, ...goto });
  }
};

const buildRunnerRules = (rules, pageId, ctx, groupId) => {
  const builtRunnerRules = flatMap(rules, (rule) => {
    let runnerRules;
    const destination = translateRoutingDestination(
      rule.destination,
      pageId,
      ctx
    );

    const { expressions, operator } = rule.expressionGroup;

    if (operator === AND || operator === OR) {
      const when = expressions.map((expression) =>
        checkValidRoutingType(expression, ctx)
      );

      runnerRules = [
        {
          ...destination,
          when: { [operator.toLowerCase()]: when },
        },
      ];
    } else {
      const when = expressions.map((expression) =>
        checkValidRoutingType(expression, ctx)
      );
      runnerRules = [
        {
          ...destination,
          when,
        },
      ];
    }

    runnerRules.map((expression) => {
      addRuleToContext(expression, groupId, ctx);
    });

    return runnerRules;
  });

  return builtRunnerRules;
};

module.exports = (routing, pageId, groupId, ctx) => {
  const { rules } = routing;

  const runnerRules = buildRunnerRules(rules, pageId, ctx, groupId);

  const destination = translateRoutingDestination(routing.else, pageId, ctx);

  return [...runnerRules, { ...destination }];
};
