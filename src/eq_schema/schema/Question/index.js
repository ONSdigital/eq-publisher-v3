const { find, get, flow, concat, last, filter } = require("lodash/fp");
const { set, remove, cloneDeep } = require("lodash");

const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const convertPipes = require("../../../utils/convertPipes");
const {
  wrapContents,
  reversePipeContent,
} = require("../../../utils/compoundFunctions");

const Answer = require("../Answer");

const { DATE, DATE_RANGE } = require("../../../constants/answerTypes");

const findDateRange = flow(get("answers"), find({ type: DATE_RANGE }));

const findMutualOption = flow(
  get("options"),
  find({mutuallyExclusive: true})
)

const findMutuallyExclusive = flow(
  get("answers"),
  find(findMutualOption),
)

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);
const reversePipe = (ctx) =>
  flow(wrapContents("contents"), reversePipeContent(ctx));

class Question {
  constructor(question, ctx) {
    this.id = `question${question.id}`;
    this.title = processPipe(ctx)(question.title);

    if (question.qCode) {
      this.q_code = question.qCode;
    }
    if (question.descriptionEnabled && question.description) {
      this.description = [convertPipes(ctx)(question.description)];
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
          title: question.definitionLabel,
          ...reversePipe(ctx)(question.definitionContent),
        },
      ];
    }
    const dateRange = findDateRange(question);
    const mutuallyExclusive = findMutuallyExclusive(question);

    if (dateRange) {
      this.type = DATE_RANGE;
      this.answers = this.buildDateRangeAnswers(dateRange);
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
    } else if (mutuallyExclusive) {
      this.type = "MutuallyExclusive";
      this.mandatory = get("properties.required", mutuallyExclusive);
      this.answers = this.buildMutuallyExclusiveAnswers(mutuallyExclusive, question.answers, ctx);
      delete this.answers[1].label;
    } else if (question.totalValidation && question.totalValidation.enabled) {
      this.type = "Calculated";
      this.answers = this.buildAnswers(question.answers, ctx);
      this.calculations = question.totalValidation.allowUnanswered
        ? [
            this.buildUnansweredCalculation(question.answers),
            this.buildCalculation(question.totalValidation, question.answers),
          ]
        : [this.buildCalculation(question.totalValidation, question.answers)];
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
        show_guidance: question.additionalInfoLabel,
        hide_guidance: question.additionalInfoLabel,
        ...reversePipe(ctx)(question.additionalInfoContent),
      };
    }
  }

  buildAnswers(answers, ctx) {
    return answers.map(answer => {
      const tempAnswer = cloneDeep(answer);
      if(tempAnswer.options) {
        remove(tempAnswer.options, {mutuallyExclusive: true})
      }
      return new Answer(tempAnswer, ctx)
    });
  }

  buildDateRangeAnswers(answer) {
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
    if (answer.qCode) {
      dateFrom.q_code = answer.qCode;
    }
    const dateTo = {
      ...commonAnswerDef,
      id: `${commonAnswerDef.id}to`,
      label: answer.secondaryLabel,
    };
    if (answer.secondaryQCode) {
      dateTo.q_code = answer.secondaryQCode;
    }
    return [dateFrom, dateTo];
  }

  buildMutuallyExclusiveAnswers(mutuallyExclusive, answers, ctx) {
    Object.assign(mutuallyExclusive.properties, { required: false });
    const mutuallyExclusiveAnswer = new Answer({
      ...mutuallyExclusive,
      id: `${mutuallyExclusive.id}-exclusive`,
      type: "Checkbox",
      options: filter({mutuallyExclusive: true}, mutuallyExclusive.options)
    });
    return concat(
      this.buildAnswers(answers, ctx),
      mutuallyExclusiveAnswer
    );
  }

  buildCalculation(totalValidation, answers) {
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
        : { answer_id: `answer${totalValidation.previousAnswer.id}` };

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
