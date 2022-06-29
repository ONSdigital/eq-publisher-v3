const formatPlaceholder = "format_";
const FORMAT_CURRENCY = `${formatPlaceholder}currency`;
const FORMAT_NUMBER = `${formatPlaceholder}number`;
const FORMAT_DATE = `${formatPlaceholder}date`;
const FORMAT_UNIT = `${formatPlaceholder}unit`;
const FORMAT_PERCENTAGE = `${formatPlaceholder}percentage`;
const FORMAT_CHECKBOX = `concatenate_list`;

// Transformation arguments
const DATE_TRANSFORMATION = "date_to_format";
const NUMBER_TRANSFORMATION = "number";
const CHECKBOX_TRANSFORMATION = "list_to_concatenate";
const PERCENTAGE_TRANSFORMATION = "value";


module.exports = {
  formatPlaceholder,
  FORMAT_CURRENCY,
  FORMAT_NUMBER,
  FORMAT_DATE,
  FORMAT_CHECKBOX,
  DATE_TRANSFORMATION,
  NUMBER_TRANSFORMATION,
  CHECKBOX_TRANSFORMATION,
  FORMAT_UNIT,
  FORMAT_PERCENTAGE,
  PERCENTAGE_TRANSFORMATION,
};
