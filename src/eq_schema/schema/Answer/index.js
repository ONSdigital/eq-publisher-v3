const { isNil } = require("lodash/fp");
const { get, has, pick } = require("lodash");
const {
  NUMBER,
  CURRENCY,
  PERCENTAGE,
  DATE,
  UNIT,
  DURATION,
  TEXTAREA,
  CHECKBOX,
  RADIO,
  SELECT,
  DROPDOWN,
  MUTUALLY_EXCLUSIVE,
} = require("../../../constants/answerTypes");
const { unitConversion } = require("../../../constants/units");
const { getValueSource } = require("../../builders/valueSource");

const { buildContents } = require("../../../utils/builders");

const multipleChoiceAnswers = [CHECKBOX, RADIO, SELECT, MUTUALLY_EXCLUSIVE];

const getMetadata = (ctx, metadataId) =>
  ctx.questionnaireJson.metadata.find(({ id }) => id === metadataId);

const getAnswerType = (answerType) => {
  if (answerType === SELECT) {
    return DROPDOWN;
  }
  return answerType;
};

class Answer {
  constructor(answer, ctx) {
    this.id = `answer${answer.id}`;
    this.mandatory = answer.properties.required;
    this.type = getAnswerType(answer.type);

    if (answer.label) {
      this.label = buildContents(answer.label, ctx);
    }

    if (answer.description) {
      this.description = buildContents(answer.description, ctx);
    }

    if (answer.qCode) {
      if (
        !ctx ||
        ctx.questionnaireJson.dataVersion === "3" ||
        (ctx.questionnaireJson.dataVersion !== "3" && answer.type !== CHECKBOX)
      ) {
        this.q_code = answer.qCode;
      }
    }

    if (answer.type === UNIT) {
      this.unit = unitConversion[answer.properties.unit];
      this.unit_length = "short";
    }

    if (answer.type === DURATION) {
      const durationUnit = get(answer, "properties.unit");
      switch (durationUnit) {
        case "YearsMonths":
          this.units = ["years", "months"];
          break;

        case "Years":
          this.units = ["years"];
          break;

        case "Months":
          this.units = ["months"];
      }
    }

    if (answer.type === TEXTAREA) {
      if (answer.properties.maxLength) {
        this.max_length = parseInt(answer.properties.maxLength);
      }
    }

    if (answer.advancedProperties && !isNil(answer.validation)) {
      if ([NUMBER, CURRENCY, PERCENTAGE, UNIT].includes(answer.type)) {
        const { minValue, maxValue } = answer.validation;

        this.buildNumberValidation(minValue, "minimum", ctx);
        this.buildNumberValidation(maxValue, "maximum", ctx);
      } else if (answer.type === DATE) {
        const { earliestDate, latestDate } = answer.validation;

        this.minimum = Answer.buildDateValidation(earliestDate, ctx);
        this.maximum = Answer.buildDateValidation(latestDate, ctx);
      }
    }

    if (
      has(answer, "properties.decimals") &&
      !multipleChoiceAnswers.includes(answer.type)
    ) {
      this.decimal_places = answer.properties.decimals;
    }

    if (answer.advancedProperties && answer.properties.defaultAnswer) {
      this.default = 0;
    }

    if (!isNil(answer.parentAnswerId)) {
      this.parent_answer_id = `answer${answer.parentAnswerId}`;
    }

    if (answer.type === CURRENCY) {
      this.currency = "GBP";
    }

    if (answer.type === DATE) {
      const format = get(answer, "properties.format");

      if (format === "yyyy") {
        this.type = "YearDate";
      }

      if (format === "mm/yyyy") {
        this.type = "MonthYearDate";
      }
    }

    if (!isNil(answer.options) && multipleChoiceAnswers.includes(answer.type)) {
      if (answer.type === RADIO) {
        answer.options.map(
          (option) =>
            option.dynamicAnswer &&
            (this.dynamic_options = Answer.buildDynamicOption(option))
        );
      }
      this.options = [];
      answer.options.forEach((option) => {
        if (!option.dynamicAnswer) {
          this.options.push(Answer.buildOption(option, answer, ctx));
        }
      });
    }
  }

  buildNumberValidation(validationRule, validationType, ctx) {
    const { enabled } = validationRule;
    if (!enabled) {
      return;
    }

    const comparator = Answer.buildComparator(validationRule, ctx);

    if (isNil(comparator)) {
      return;
    }

    this[validationType] = {
      ...comparator,
      exclusive: !validationRule.inclusive,
    };
  }

  static buildDateValidation(validationRule, ctx) {
    const { enabled } = validationRule;
    if (!enabled) {
      return;
    }

    let comparator = Answer.buildComparator(validationRule, ctx);

    if (isNil(comparator)) {
      return;
    }

    if (validationRule.entityType === "Custom" && validationRule.custom) {
      comparator = { value: validationRule.custom.substring(0, 10) };
    }

    const { offset, relativePosition } = validationRule;
    const multiplier = relativePosition === "Before" ? -1 : 1;
    const offsetValue = offset.value * multiplier;
    const offsetUnit = offset.unit.toLowerCase();

    return {
      ...comparator,
      offset_by: {
        [offsetUnit]: offsetValue,
      },
    };
  }

  static buildComparator(validationRule, ctx) {
    const {
      entityType = "Custom",
      custom,
      previousAnswer,
      metadata,
    } = validationRule;
    if (entityType === "Custom") {
      if (isNil(custom)) {
        return;
      }
      return { value: custom };
    }
    if (entityType === "Now") {
      return { value: "now" };
    }
    if (entityType === "PreviousAnswer") {
      if (isNil(previousAnswer)) {
        return;
      }
      return {
        value: getValueSource(ctx, previousAnswer),
      };
    }

    if (entityType === "Metadata") {
      if (isNil(metadata)) {
        return;
      }

      return {
        value: {
          source: "metadata",
          identifier: getMetadata(ctx, metadata).key,
        },
      };
    }
    return;
  }

  static buildDynamicOption({ dynamicAnswerID }) {
    const DynamicOption = {
      values: {
        source: "answers",
        identifier: `answer${dynamicAnswerID}`,
      },
      transform: {
        "option-label-from-value": ["self", `answer${dynamicAnswerID}`],
      },
    };
    return DynamicOption;
  }

  static buildOption(
    { label, description, additionalAnswer, qCode: q_code },
    { properties, type },
    ctx
  ) {
    const option = {
      label: buildContents(label, ctx, true),
      value: buildContents(label, ctx, true),
    };

    if (q_code) {
      if (!ctx || ctx.questionnaireJson.dataVersion !== "3") {
        option.q_code = q_code;
      }
    }

    if (description) {
      option.description = buildContents(description, ctx);
    }
    if (additionalAnswer) {
      option.detail_answer = {
        ...pick(additionalAnswer, ["label", "type"]),
        id: `answer${additionalAnswer.id}`,
        mandatory: properties.required,
      };

      if (additionalAnswer.qCode && type !== "Checkbox") {
        option.detail_answer.q_code = additionalAnswer.qCode;
      }
    }
    return option;
  }
}

module.exports = Answer;
