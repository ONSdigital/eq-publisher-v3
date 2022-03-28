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

const mutuallyExclusiveId = (left, right, ctx) => {
  flatMap(ctx.questionnaireJson.sections, (section) =>
    flatMap(section.folders, (folder) =>
      flatMap(folder.pages, (page) =>
        flatMap(page.answers, (answer) => {
          const options = answer.options ? answer.options : [];

          if (options.length !== 0) {
            options.map((option) => {
              if (
                option.id === right.optionIds[0] &&
                option.mutuallyExclusive
              ) {
                option.id = `${option.id}-exclusive`;
                left.answerId = `${left.answerId}-exclusive`;
                right.optionIds[0] = `${right.optionIds[0]}-exclusive`;
              }
            });
          }
        })
      )
    )
  );
};

const buildAnswerObject = (
  { left, condition, secondaryCondition, right },
  ctx
) => {
  const returnVal = [
    {
      source: checkType(left.type),
      identifier: `answer${left.answerId}`,
    },
  ];

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
    mutuallyExclusiveId(left, right, ctx);

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

    const SelectedOptions = {
      [routingConditionConversion(condition)]: optionValues,
    };

    return SelectedOptions;
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
