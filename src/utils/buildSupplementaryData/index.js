const buildSupplementaryData = (supplementaryData) => {
  const lists = [];

  supplementaryData.data.forEach((dataValue) => {
    if (
      !lists.includes(dataValue.listName) &&
      dataValue.listName !== ""
    ) {
      lists.push(dataValue.listName);
    }
  });

  return {lists};
};

module.exports = buildSupplementaryData;
