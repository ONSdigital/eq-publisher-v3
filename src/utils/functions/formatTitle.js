const formatTitle = (stringToFormat) => {
  const formattedString = stringToFormat.replace(/'/g, "&#39;"); // Replace ' with &#39;
  return formattedString;
};

module.exports = { formatTitle };
