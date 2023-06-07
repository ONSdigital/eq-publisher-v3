const formatPageDescription = (stringToFormat) => {
  // Remove special characters from string, replace spaces with hyphens, and convert to lower case
  const formattedString = stringToFormat
    .replace(/[^\w\s]/gi, "")
    .replace(/ /g, "-")
    .toLowerCase();

  return formattedString;
};

module.exports = { formatPageDescription };
