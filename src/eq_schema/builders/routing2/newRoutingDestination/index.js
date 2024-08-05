const routingConditionConversion = require("../../../../utils/routingConditionConversion");
const {
  getMetadataKey,
} = require("../../../../utils/contentUtils/getMetadataKey");
const { getValueSource } = require("../../valueSource");
const { getAnswerById } = require("../../../../utils/functions/answersGetters");
const { getListFromAll } = require("../../../../utils/functions/listGetters");

const { flatMap, filter, find } = require("lodash");

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

  const optionResults = optionIds.map((id) => {
    const option = find(options, { id });

    const updatedLabel = option.label
      .replace(/&apos;/g, `\u2019`)
      .replace(/'/g, `\u2019`)
      .replace(/‘/g, `\u2019`);

    return updatedLabel.trim();
  });

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

  if (type === "Metadata") {
    return "metadata";
  }

  if (type === "List") {
    return "list";
  }

  return null;
};

const buildAnswerObject = (
  { left, condition, secondaryCondition, right },
  ctx
) => {
  let returnVal = [getValueSource(ctx, left.answerId)];

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

    // need to call const leftSideAnswer = getAnswerById (ctx, left.answerId) (for testing replace left.answerID with  id string in the export schema, should only print that one answer object.)
    // the nested if statments need updating
    if (condition === "OneOf") {
      if (
        getAnswerById(ctx.questionnaireJson, left.answerId) &&
        optionValues[0].length === 1
      ) {
        const SelectedOptions = {
          [routingConditionConversion("AllOf")]: optionValues,
        };
        return SelectedOptions;
      }
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
      right.dateValue.offsetDirection === "Before"
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

const buildMetadataObject = (expression, ctx) => {
  const { condition, left, right } = expression;
  const returnValue = [
    {
      source: checkType(left.type),
      identifier: getMetadataKey(ctx, left.metadataId),
    },
    right.customValue.text,
  ];
  return { [routingConditionConversion(condition)]: returnValue };
};

const buildListObject = (expression, ctx) => {
  const { condition, secondaryCondition, left, right } = expression;
  // Error trap as currently countOf is the only condition for lists, this may be extended later on.
  if (condition !== "CountOf") {
    throw new Error(
      `${condition} is not a valid routing condition for list type`
    );
  }

  const list = getListFromAll(ctx, left.listId);

  const countOfObject = [
    {
      count: [
        {
          source: checkType(left.type),
          identifier: list.listName,
        },
      ],
    },
    right.customValue.number,
  ];

  return { [routingConditionConversion(secondaryCondition)]: countOfObject };
};

const checkValidRoutingType = (expression, ctx) => {
  if (expression.left.type === "Answer") {
    return buildAnswerObject(expression, ctx);
  } else if (expression.left.type === "Metadata") {
    return buildMetadataObject(expression, ctx);
  } else if (expression.left.type === "List") {
    return buildListObject(expression, ctx);
  } else {
    throw new Error(
      `${expression.left.type} is not a valid routing answer type`
    );
  }
};

module.exports = checkValidRoutingType;
// create a new file called answersGetters.js > import getPages function from pageGetters.js > import flatmap from loadash
// create a new function called getAnswerID() which take in ctx and answerId > this function will utilise getPages function from pageGetters so we retrieve all the pages from the survey.
// then retrieve all the answers from the pages > hint: use flatmap to do this, and can be done in one line.
// finally , use .find() method to iterate all the answers to find the right answers object using the answer id parameter
