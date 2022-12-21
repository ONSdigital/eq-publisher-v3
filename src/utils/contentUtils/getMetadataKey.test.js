const { getMetadataKey } = require("./getMetadataKey");
const {
  questionnaireJson,
} = require("../../eq_schema/builders/basicQuestionnaireJSON");

describe("getMetadataKey", () => {
  let ctx = {};
  ctx.questionnaireJson = questionnaireJson;

  it("should return metadata key for valid metadataId", () => {
    const metadataKey = getMetadataKey(ctx, "metadata-1");
    expect(metadataKey).toBe("ru_name");
  });

  it("should return null for invalid metadataId", () => {
    const metadataKey = getMetadataKey(ctx, "not-metadata-1");
    expect(metadataKey).toBeNull();
  });
});
