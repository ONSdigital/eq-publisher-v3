const { unitConversion } = require("../../constants/units");

const {
  FORMAT_CURRENCY,
  FORMAT_DATE,
  FORMAT_NUMBER,
  NUMBER_TRANSFORMATION,
  DATE_TRANSFORMATION,
  FORMAT_UNIT,
} = require("../../constants/piping");

// Do we need this, we're not passing anything from author about Date Formats
// when constructing in publisher.
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
  Unit: { format: FORMAT_UNIT, transformKey: NUMBER_TRANSFORMATION },
};

const buildStructure = (AnswerType, value, fallback) => {
  const transformStructure = (source, identifier, dateFormat, unitType) => {
    const transformKey = [TRANSFORM_MAP[AnswerType].transformKey];

    const options = {
      [transformKey]: {
        source,
        identifier,
      },
    };

    let format;
    switch (AnswerType) {
      case "Date":
        format =
          source === "metadata"
            ? DATE_FORMAT_MAP["dd/mm/yyyy"]
            : DATE_FORMAT_MAP[dateFormat];

        options.date_format = format;
        break;
      case "DateRange":
        format = DATE_FORMAT_MAP["dd/mm/yyyy"];

        options.date_format = format;
        break;
      case "Unit":
        options.unit = unitConversion[unitType];
        break;
    }

    let transform;

    if (fallback) {
      const metaIdentifier = identifier.includes("to")
        ? fallback.to
        : fallback.from;

      const items = {
        items: [
          {
            source,
            identifier,
          },
          {
            source: "metadata",
            identifier: metaIdentifier,
          },
        ],
      };

      transform = [
        {
          transform: "first_non_empty_item",
          arguments: items,
        },
        {
          transform: TRANSFORM_MAP[AnswerType].format,
          arguments: {
            [transformKey]: {
              source: "previous_transform",
            },
            date_format: format,
          },
        },
      ];

      return transform;
    } else {
      transform = [
        {
          transform: TRANSFORM_MAP[AnswerType].format,
          arguments: options,
        },
      ];

      return transform;
    }
  };

  const structure = {
    value,
    format: TRANSFORM_MAP[AnswerType].format,
    transforms: transformStructure,
  };

  return structure;
};

module.exports = {
  buildStructure,
};