const buildSupplementaryData = (supplementaryData) => {
  const allSupplementaryData = [];

  supplementaryData.data.forEach((dataValue) => {
    if (
      !allSupplementaryData.includes(dataValue.listName) &&
      dataValue.listName !== ""
    ) {
      allSupplementaryData.push(dataValue.listName);
    }
  });

  return allSupplementaryData;
};

module.exports = buildSupplementaryData;
