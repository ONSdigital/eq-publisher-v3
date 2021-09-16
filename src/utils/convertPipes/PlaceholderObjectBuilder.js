//const { unitConversion } = require("../../constants/units");

const {
  FORMAT_CURRENCY,
  FORMAT_DATE,
  FORMAT_NUMBER,
  NUMBER_TRANSFORMATION,
  DATE_TRANSFORMATION,
  // FORMAT_UNIT,
} = require("../../constants/piping");
const { removeDash } = require("../HTMLUtils");

const DATE_FORMAT_MAP = {
  "dd/mm/yyyy": "d MMMM yyyy",
  "mm/yyyy": "MMMM yyyy",
  yyyy: "yyyy",
};

const TRANSFORM_MAP = {
  Currency: { format: FORMAT_CURRENCY, transformKey: NUMBER_TRANSFORMATION },
  Number: { format: FORMAT_NUMBER, transformKey: NUMBER_TRANSFORMATION },
  Date: { format: FORMAT_DATE, transformKey: DATE_TRANSFORMATION },
  DateRange: { format: FORMAT_DATE, transformKey: DATE_TRANSFORMATION },
  // Unit: { format: FORMAT_UNIT, transformKey: NUMBER_TRANSFORMATION },
};

const placeholderObjectBuilder = (
  source,
  identifier,
  dateFormat,
  unitType,
  fallback,
  AnswerType
) => {

  let valueSource;
  let argumentList;
  let placeHolder;

  if (["metadata","answers"].includes(source)) {
    valueSource = {
      source,
      identifier
    }
  };

  if ([AnswerType]in(TRANSFORM_MAP)) {
    if (["Date","DateRange"].includes(AnswerType)) {
      argumentList={
        "date_format" : DATE_FORMAT_MAP[dateFormat ? dateFormat : "dd/mm/yyyy" ]
      }
    }
    if (["Number","Currency"].includes(AnswerType)) {
      argumentList={
      }
    }
    if (["Unit"].includes(AnswerType)) {
      argumentList={
        // leaving here until unit added to runner
        // "unit": unitConversion[unitType]
      }
    }
  }

  if (fallback) {
    placeHolder = {
      placeholder: removeDash(identifier),
      transforms: [
        {
          transform: "first_non_empty_item",
          arguments: {
            items: [
              valueSource,
              fallback
            ]
          }
        },
      ]
    }
    if ([AnswerType]in(TRANSFORM_MAP)) {
      placeHolder.transforms.push(
        {
          transform: TRANSFORM_MAP[AnswerType].format,
          arguments: { [TRANSFORM_MAP[AnswerType].transformKey] : { source: "previous_transform" }, ...argumentList }
        }
      )
    }
    return placeHolder
  }

  if ([AnswerType]in(TRANSFORM_MAP)) {
    return {
      placeholder: removeDash(identifier),
      transforms: [
        {
          transform: TRANSFORM_MAP[AnswerType].format,
          arguments: { [TRANSFORM_MAP[AnswerType].transformKey]: valueSource, ...argumentList }
        },
      ]
    }
  }

  return {
    placeholder: removeDash(identifier),
    value: valueSource,
  };

};

module.exports = {
  placeholderObjectBuilder,
};
