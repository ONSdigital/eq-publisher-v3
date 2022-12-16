const { find } = require("lodash");

const getMetadataKey = (ctx, metadataId) => {
  const metadata = find(ctx.questionnaireJson.metadata, { id: metadataId });
  if (metadata) {
    return metadata.key;
  }
  return null;
};

module.exports = { getMetadataKey };
