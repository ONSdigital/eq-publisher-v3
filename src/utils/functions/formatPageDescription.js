const formatPageDescription = (stringToFormat) => {
  // Remove special characters from string, replace spaces with hyphens, and convert to lower case
  const formattedString = stringToFormat
    .trim()
    .replace(/[^\w\s-]/gi, "")
    .replace(/ /g, "-")
    .split(/-+/).join('-')
    .toLowerCase();

  return formattedString;
};

module.exports = { formatPageDescription };
