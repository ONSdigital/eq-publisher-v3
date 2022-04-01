const checkValidRoutingType = require("./newRoutingDestination");
const translateRoutingDestination = require("./translateRoutingDestination");
const { flatMap } = require("lodash");
const { AND, OR } = require("../../../constants/routingOperators");

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
          when: when[0],
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

const buildSkipConditionRules = (routing, ctx) => {
  const skipCondition = routing.reduce((acc, route) => {
    const { expressions, operator } = route;

    if (expressions.length > 1) {
      const skipRules = expressions.map((expression) => {
        return checkValidRoutingType(expression, ctx);
      });

      return {
        when: { [operator.toLowerCase()]: skipRules },
      };
    } else {
      const when = expressions.reduce((acc, expression) => {
        return checkValidRoutingType(expression, ctx);
      }, {});

      return { when: when };
    }
  }, {});

  return skipCondition;
};

module.exports = (routing, pageId, groupId, type, ctx) => {
  if (type === "routing") {
    const { rules } = routing;

    const runnerRules = buildRunnerRules(rules, pageId, ctx, groupId);

    const destination = translateRoutingDestination(routing.else, pageId, ctx);

    return [...runnerRules, { ...destination }];
  } else if (type === "skip") {
    const skipConditions = buildSkipConditionRules(routing, ctx);

    return skipConditions;
  }
};
