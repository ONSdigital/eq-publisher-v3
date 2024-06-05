const { find, get, flow, concat, last } = require("lodash/fp");
const { set, remove, cloneDeep, filter } = require("lodash");

const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const convertPipes = require("../../../utils/convertPipes");
const {
  wrapContents,
  reversePipeContent,
} = require("../../../utils/compoundFunctions");
const {
  getList,
  getSupplementaryList,
} = require("../../../utils/functions/listGetters");
const { getPagesByListId } = require("../../../utils/functions/pageGetters");

const Answer = require("../Answer");
const { getValueSource } = require("../../builders/valueSource");

const {
  DATE,
  DATE_RANGE,
  MUTUALLY_EXCLUSIVE,
} = require("../../../constants/answerTypes");

const findDateRange = flow(get("answers"), find({ type: DATE_RANGE }));

const findMutualOption = flow(
  get("options"),
  find({ mutuallyExclusive: true })
);

const findMutuallyExclusive = flow(get("answers"), find(findMutualOption));

const processPipe = (ctx, isMultipleChoiceValue = false, isRepeatingSection) =>
  flow(
    convertPipes(ctx, isMultipleChoiceValue, isRepeatingSection),
    getInnerHTMLWithPiping
  );
const reversePipe = (ctx) =>
  flow(wrapContents("contents"), reversePipeContent(ctx));

const getSectionByPageId = (ctx, pageId) => {
  let result;
  ctx.questionnaireJson.sections.forEach((section) => {
    section.folders.forEach((folder) => {
      folder.pages.forEach((page) => {
        if (page.id === pageId) {
          result = section;
        }
      });
    });
  });
  return result;
};

class Question {
  constructor(question, ctx) {
    this.id = `question${question.id}`;

    const section = getSectionByPageId(ctx, question.id);

    this.title = processPipe(
      ctx,
      false,
      section.repeatingSection
    )(question.title);

    if (question.qCode) {
      this.q_code = question.qCode.trim();
    }
    if (question.descriptionEnabled && question.description) {
      this.description = [
        convertPipes(
          ctx,
          false,
          section.repeatingSection
        )(question.description),
      ];
    }

    if (question.guidanceEnabled && question.guidance) {
      this.guidance = reversePipe(ctx)(question.guidance);
    }

    if (
      question.definitionEnabled &&
      (question.definitionLabel || question.definitionContent)
    ) {
      this.definitions = [
        {
          title: processPipe(ctx)(question.definitionLabel),
          ...reversePipe(ctx)(question.definitionContent),
        },
      ];
    }
    const dateRange = findDateRange(question);
    const mutuallyExclusive = findMutuallyExclusive(question);

    if (question.answers.some((answer) => answer.repeatingLabelAndInput)) {
      this.type = "General";
      const list =
        getList(ctx, question.answers[0].repeatingLabelAndInputListId) ||
        getSupplementaryList(
          ctx,
          question.answers[0].repeatingLabelAndInputListId
        );
      this.dynamic_answers = {
        values: {
          source: "list",
          identifier: list.listName,
        },

        answers: this.buildAnswers(question.answers, ctx),
      };

      const ListCollectorPages = filter(
        getPagesByListId(ctx, question.answers[0].repeatingLabelAndInputListId),
        { pageType: "ListCollectorConfirmationPage" }
      );

      if (ListCollectorPages.length) {
        const expressions = ListCollectorPages.map((page) => ({
          condition: "Unanswered",
          left: {
            answerId: page.answers[0].id,
            type: "Answer",
          },
          right: {
            optionIds: [],
          },
        }));
        const newSkip = {
          expressions: expressions,
          operator: "And",
        };

        if (question.skipConditions) {
          question.skipConditions = [newSkip, ...question.skipConditions];
        } else {
          question.skipConditions = [newSkip];
        }
      }

      if (question.totalValidation && question.totalValidation.enabled) {
        this.type = "Calculated";
        this.calculations = question.totalValidation.allowUnanswered
          ? [
              this.buildUnansweredCalculation(question.answers),
              this.buildCalculation(
                question.totalValidation,
                question.answers,
                ctx
              ),
            ]
          : [
              this.buildCalculation(
                question.totalValidation,
                question.answers,
                ctx
              ),
            ];
      }
    } else if (dateRange) {
      this.type = DATE_RANGE;
      this.answers = this.buildDateRangeAnswers(
        dateRange,
        ctx.questionnaireJson.dataVersion
      );
      const { earliestDate, latestDate, minDuration, maxDuration } =
        dateRange.validation;
      if (dateRange.advancedProperties) {
        if (earliestDate.enabled || latestDate.enabled) {
          this.answers[0].minimum = Answer.buildDateValidation(
            earliestDate,
            ctx
          );
          this.answers[1].maximum = Answer.buildDateValidation(latestDate, ctx);
        }

        if (minDuration.enabled) {
          set(
            this,
            `period_limits.minimum.${minDuration.duration.unit}`.toLowerCase(),
            minDuration.duration.value
          );
        }
        if (maxDuration.enabled) {
          set(
            this,
            `period_limits.maximum.${maxDuration.duration.unit}`.toLowerCase(),
            maxDuration.duration.value
          );
        }
      }
    } else if (
      question.answers.some((answer) => answer.type === MUTUALLY_EXCLUSIVE)
    ) {
      this.type = "MutuallyExclusive";
      this.mandatory = question.answers[0].properties.required;
      this.answers = this.buildMutuallyExclusiveAnswers(
        mutuallyExclusive,
        question.answers,
        ctx
      );
    } else if (question.totalValidation && question.totalValidation.enabled) {
      this.type = "Calculated";
      this.answers = this.buildAnswers(question.answers, ctx);
      this.calculations = question.totalValidation.allowUnanswered
        ? [
            this.buildUnansweredCalculation(question.answers),
            this.buildCalculation(
              question.totalValidation,
              question.answers,
              ctx
            ),
          ]
        : [
            this.buildCalculation(
              question.totalValidation,
              question.answers,
              ctx
            ),
          ];
    } else {
      this.type = "General";
      this.answers = this.buildAnswers(question.answers, ctx);
    }

    if (
      question.additionalInfoEnabled &&
      (question.additionalInfoLabel || question.additionalInfoContent)
    ) {
      if (!this.answers.length) {
        throw new Error(
          `Cannot add additional information to question '${question.id}' because it has no answers.`
        );
      }

      last(this.answers).guidance = {
        show_guidance: processPipe(ctx)(question.additionalInfoLabel),
        hide_guidance: processPipe(ctx)(question.additionalInfoLabel),
        ...reversePipe(ctx)(question.additionalInfoContent),
      };
    }
  }

  buildAnswers(answers, ctx) {
    return answers.map((answer) => {
      const tempAnswer = cloneDeep(answer);
      if (tempAnswer.options) {
        remove(tempAnswer.options, { mutuallyExclusive: true });
      }
      return new Answer(tempAnswer, ctx);
    });
  }

  buildDateRangeAnswers(answer, dataVersion) {
    const commonAnswerDef = {
      id: `answer${answer.id}`,
      type: DATE,
      mandatory: get("properties.required", answer),
    };
    const dateFrom = {
      ...commonAnswerDef,
      id: `${commonAnswerDef.id}from`,
      label: answer.label,
    };
    if (dataVersion !== "3") {
      if (answer.qCode) {
        dateFrom.q_code = answer.qCode.trim();
      }
    }
    const dateTo = {
      ...commonAnswerDef,
      id: `${commonAnswerDef.id}to`,
      label: answer.secondaryLabel,
    };
    if (dataVersion !== "3") {
      if (answer.secondaryQCode) {
        dateTo.q_code = answer.secondaryQCode.trim();
      }
    }
    return [dateFrom, dateTo];
  }

  buildMutuallyExclusiveAnswers(mutuallyExclusive, answers, ctx) {
    let mutuallyExclusiveAnswer;
    answers.forEach((answer) => {
      answer.properties.required = false;

      if (answer.type === MUTUALLY_EXCLUSIVE && answer.options.length === 1) {
        answers = answers.filter(
          (answer) => answer.type !== MUTUALLY_EXCLUSIVE
        );
        const tempAnswer = {
          ...answer,
          type: "Checkbox",
        };
        tempAnswer.options[0].qCode = answer.qCode && answer.qCode.trim();
        delete tempAnswer.qCode;
        mutuallyExclusiveAnswer = new Answer(tempAnswer, ctx);
      } else if (
        answer.type === MUTUALLY_EXCLUSIVE &&
        answer.options.length > 1
      ) {
        answers = answers.filter(
          (answer) => answer.type !== MUTUALLY_EXCLUSIVE
        );
        mutuallyExclusiveAnswer = new Answer(
          {
            ...answer,
            type: "Radio",
          },
          ctx
        );
      } else {
        return;
      }
    });

    return concat(this.buildAnswers(answers, ctx), mutuallyExclusiveAnswer);
  }

  buildCalculation(totalValidation, answers, ctx) {
    const GREATER_THAN = "greater than";
    const LESS_THAN = "less than";
    const EQUALS = "equals";

    const AUTHOR_TO_RUNNER_CONDITIONS = {
      GreaterThan: [GREATER_THAN],
      GreaterOrEqual: [GREATER_THAN, EQUALS],
      Equal: [EQUALS],
      LessOrEqual: [LESS_THAN, EQUALS],
      LessThan: [LESS_THAN],
    };

    const rightSide =
      totalValidation.entityType === "Custom"
        ? { value: totalValidation.custom }
        : { value: getValueSource(ctx, totalValidation.previousAnswer) };

    return {
      calculation_type: "sum",
      answers_to_calculate: answers.map((a) => `answer${a.id}`),
      conditions: AUTHOR_TO_RUNNER_CONDITIONS[totalValidation.condition],
      ...rightSide,
    };
  }

  buildUnansweredCalculation(answers) {
    return {
      calculation_type: "sum",
      answers_to_calculate: answers.map((a) => `answer${a.id}`),
      conditions: ["equals"],
      value: 0,
    };
  }
}

module.exports = Question;
