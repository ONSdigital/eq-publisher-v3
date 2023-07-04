const formatTitle = (stringToFormat) => {
  return stringToFormat ? stringToFormat.replace(/['’]/g, "&#39;") : "";
};

module.exports = { formatTitle };
