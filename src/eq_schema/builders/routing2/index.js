const checkValidRoutingType = require("./newRoutingDestination");
const translateRoutingDestination = require("./translateRoutingDestination");
const { flatMap } = require("lodash");
const { AND, OR, NOT } = require("../../../constants/routingOperators");

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

    const { expressions, operator } = rule.expressionGroup;

    if (operator === AND || operator === OR || operator === NOT) {
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

  const destination = translateRoutingDestination(routing.else, pageId, ctx);

  return [...rules, { ...destination }];
};
