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
} = require("../../../constants/answerTypes");
const { unitConversion } = require("../../../constants/units");

const getMetadata = (ctx, metadataId) =>
  ctx.questionnaireJson.metadata.find(({ id }) => id === metadataId);

class Answer {
  constructor(answer, ctx) {
    this.id = `answer${answer.id}`;
    this.mandatory = answer.properties.required;
    this.type = answer.type;

    if (answer.label) {
      this.label = answer.label;
    }

    if (answer.description) {
      this.description = answer.description;
    }

    if (answer.qCode) {
      this.q_code = answer.qCode;
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

        this.buildNumberValidation(minValue, "minimum");
        this.buildNumberValidation(maxValue, "maximum");
      } else if (answer.type === DATE) {
        const { earliestDate, latestDate } = answer.validation;

        this.minimum = Answer.buildDateValidation(earliestDate, ctx);
        this.maximum = Answer.buildDateValidation(latestDate, ctx);
      }
    }

    if (has(answer, "properties.decimals")) {
      this.decimal_places = answer.properties.decimals;
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

    if (!isNil(answer.options)) {
      this.options = answer.options.map((option) =>
        Answer.buildOption(option, answer)
      );
    }
  }

  buildNumberValidation(validationRule, validationType) {
    const { enabled } = validationRule;
    if (!enabled) {
      return;
    }

    const comparator = Answer.buildComparator(validationRule);

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
        value: {
          source: "answers",
          identifier: `answer${previousAnswer}`,
        },
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

  static buildOption(
    { label, description, additionalAnswer, qCode: q_code },
    { properties, type }
  ) {
    const option = {
      label,
      value: label,
    };

    if (q_code) {
      option.q_code = q_code;
    }

    if (description) {
      option.description = description;
    }
    if (additionalAnswer) {
      option.detail_answer = {
        ...pick(additionalAnswer, ["label", "type"]),
        id: `answer${additionalAnswer.id}`,
        mandatory: properties.required,
        q_code: additionalAnswer.qCode,
      };

      if (additionalAnswer.qCode && type !== "Checkbox") {
        option.detail_answer.q_code = additionalAnswer.qCode;
      }
    }
    return option;
  }
}

module.exports = Answer;
