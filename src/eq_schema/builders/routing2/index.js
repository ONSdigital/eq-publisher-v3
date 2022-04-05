const checkValidRoutingType = require("./newRoutingDestination");
const translateRoutingDestination = require("./translateRoutingDestination");
const { flatMap } = require("lodash");
const { AND, OR } = require("../../../constants/routingOperators");
const {
  extendingDifferentTypeKindMessage,
} = require("graphql/validation/rules/PossibleTypeExtensions");

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
  const createSkipConditionNonOR = (routing) => {
    return routing.reduce((acc, route) => {
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
  };

  if (routing.length > 1) {
    let skips = [];
    routing.map((route) => {
      const { expressions, operator } = route;

      if (expressions.length > 1) {
        let multiple;
        multiple = expressions.map((expression) => {
          return checkValidRoutingType(expression, ctx);
        });

        skips.push({ [operator.toLowerCase()]: multiple });

        return skips;
      }

      skips.push(
        expressions.reduce(
          (acc, expression) => checkValidRoutingType(expression, ctx),
          {}
        )
      );

      return skips;
    });
    return { when: { or: skips } };
  }

  const skipCondition = createSkipConditionNonOR(routing);

  return skipCondition;
};

module.exports = (routing, pageId, groupId, type, ctx) => {
  if (!type) {
    throw new Error(
      "No type provided. Don't know if it's a skip or route rule."
    );
  }

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
