const { unitConversion } = require("../../constants/units");

const {
  FORMAT_CURRENCY,
  FORMAT_DATE,
  FORMAT_NUMBER,
  NUMBER_TRANSFORMATION,
  DATE_TRANSFORMATION,
  FORMAT_UNIT,
} = require("../../constants/piping");

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
  // Text: { format: "non_empty_string", transformKey: "non_empty_string" },
  // Text_Optional: {
  //   format: "non_empty_string",
  //   transformKey: "non_empty_string",
  // },
};

const transformArrayBuilder = (
  source,
  identifier,
  dateFormat,
  unitType,
  fallback,
  metaFallback,
  AnswerType
) => {
  // console.log("transformKey", transformKey);
  // console.log("source", source);
  // console.log("identifier", identifier);
  // console.log("dateFormat", dateFormat);
  // console.log("unitType", unitType);
  // console.log("fallback", fallback);
  // console.log("metaFallback", metaFallback);
  // console.log("AnswerType", AnswerType);

  const transformKey = TRANSFORM_MAP[AnswerType]
    ? [TRANSFORM_MAP[AnswerType].transformKey]
    : "value";
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
  let items;

  if (
    metaFallback.fallbackKey !== "" &&
    metaFallback.fallbackKey !== undefined
  ) {
    const { key, fallbackKey } = metaFallback;

    items = {
      items: [
        {
          source,
          identifier: key,
        },
        {
          source,
          identifier: fallbackKey,
        },
      ],
    };

    transform = [
      {
        transform: "first_non_empty_item",
        arguments: items,
      },
    ];

    return transform;
  }

  if (fallback !== null) {
    const metaIdentifier = identifier.includes("to")
      ? fallback.to
      : fallback.from;

    items = {
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
  }

  transform = [
    {
      transform: TRANSFORM_MAP[AnswerType]
        ? TRANSFORM_MAP[AnswerType].format
        : "boom",
      arguments: options,
    },
  ];

  return transform;
};

module.exports = {
  transformArrayBuilder,
};
