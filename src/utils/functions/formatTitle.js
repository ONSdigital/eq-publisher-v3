const { replace } = require("lodash/fp");

const formatTitle = (stringToFormat) => {
  //console.log(typeof stringToFormat === "string");
  //return stringToFormat ? stringToFormat.replace(/&apos;/g, "&#39;") : "";
  const formatted = replace(/&apos;/g, `&#39;`, stringToFormat);
  return formatted;
};

module.exports = { formatTitle };
