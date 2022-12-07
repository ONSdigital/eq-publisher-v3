const routingConditionConversion = require("../../../../utils/routingConditionConversion");
const { flatMap, filter } = require("lodash");

const authorConditions = {
  UNANSWERED: "Unanswered",
};

const getOptionsFromQuestionaire = (questionnaire) => {
  const pages = flatMap(questionnaire.sections, (section) =>
    flatMap(section.folders, "pages")
  );
  const answers = flatMap(pages, "answers");

  return flatMap(filter(answers, "options"), "options");
};

const getOptionValues = (optionIds, questionnaire) => {
  const options = getOptionsFromQuestionaire(questionnaire);

  const optionResults = optionIds.map((id) => filter(options, { id })[0].label);

  if (optionResults === undefined || optionResults.length < 0) {
    return null;
  } else {
    return optionResults;
  }
};

const checkType = (type) => {
  if (!type) {
    return null;
  }

  if (type === "Answer") {
    return "answers";
  }

  return null;
};

const buildAnswerObject = (
  { left, condition, secondaryCondition, right },
  ctx
) => {
  let returnVal = [
    {
      source: checkType(left.type),
      identifier: `answer${left.answerId}`,
    },
  ];

  if (right.type === "DateValue") {
    returnVal = [
      {
        date: [returnVal[0]],
      },
    ];
  }

  if (right === null) {
    returnVal.push(null);

    const finalVal = { [routingConditionConversion(condition)]: returnVal };

    return finalVal;
  }

  if (condition === "CountOf") {
    const countOfObject = [
      {
        count: [
          {
            source: checkType(left.type),
            identifier: `answer${left.answerId}`,
          },
        ],
      },
      right.customValue.number,
    ];

    const finalVal = {
      [routingConditionConversion(secondaryCondition)]: countOfObject,
    };

    return finalVal;
  }

  if (right.type === "SelectedOptions") {
    const optionValues = [
      condition !== authorConditions.UNANSWERED
        ? getOptionValues(right.optionIds, ctx.questionnaireJson)
        : null,
      {
        identifier: `answer${left.answerId}`,
        source: checkType(left.type),
      },
    ];

    if (condition === "NotAnyOf") {
      const SelectedOptions = {
        [routingConditionConversion(condition)]: [{ "any-in": optionValues }],
      };

      return SelectedOptions;
    }

    if (condition === "OneOf") {
      const swapOptionValues = ([optionValues[0], optionValues[1]] = [
        optionValues[1],
        optionValues[0],
      ]);
      const SelectedOptions = {
        [routingConditionConversion(condition)]: swapOptionValues,
      };

      return SelectedOptions;
    }

    const SelectedOptions = {
      [routingConditionConversion(condition)]: optionValues,
    };

    return SelectedOptions;
  } else if (right.type === "DateValue") {
    const offsetValue =
      routingConditionConversion(condition) === "<"
        ? -1 * right.dateValue.offset
        : right.dateValue.offset;

    const dateValueRouting = {
      date: [
        "now",
        {
          years: offsetValue,
        },
      ],
    };

    returnVal.push(dateValueRouting);
  } else {
    if (condition !== authorConditions.UNANSWERED) {
      returnVal.push(right.customValue.number);
    } else {
      returnVal.push(null);
    }
  }

  const finalVal = { [routingConditionConversion(condition)]: returnVal };

  return finalVal;
};

const checkValidRoutingType = (expression, ctx) => {
  if (expression.left.type === "Answer") {
    return buildAnswerObject(expression, ctx);
  } else {
    throw new Error(
      `${expression.left.type} is not a valid routing answer type`
    );
  }
};

module.exports = checkValidRoutingType;
