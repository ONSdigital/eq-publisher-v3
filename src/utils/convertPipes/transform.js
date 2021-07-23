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

// this returns
// structure {
//   value: 'answer3bd97c0f-7e79-4cb3-9823-159c7ef6674ato',
//   format: 'format_date',
//   options: [Function: structureOptions]
// }
// options {
//   date_to_format: {
//     source: 'answers',
//     identifier: 'answer3bd97c0f-7e79-4cb3-9823-159c7ef6674ato'
//   },
//   date_format: 'd MMMM yyyy'
// }
// Which is then used to build the transform

const buildStructure = (AnswerType, value) => {
  //Unit type and DateFormat are both undefined
  const structureOptions = (source, identifier, dateFormat, unitType) => {
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

    return options;
  };

  const structure = {
    value,
    format: TRANSFORM_MAP[AnswerType].format,
    options: structureOptions,
  };

  return structure;
};

// Create another function that accepts the structure from transform and returns the transform
// What do we need
// structure, elementData
const buildTransform = (structure) => {};

module.exports = {
  buildStructure,
  buildTransform,
};
