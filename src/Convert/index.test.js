const Convert = require(".");

describe("Convert", () => {
  let convert;
  let mockSchemaValidator;

  beforeEach(() => {
    mockSchemaValidator = {
      validate: jest.fn()
    };
    convert = new Convert(mockSchemaValidator);
  });

  describe("constructor", () => {
    it("expects a schema validator", () => {
      expect(() => new Convert()).toThrow();
    });

    it("should set schema validator as property", () => {
      expect(convert.schemaValidator).toBe(mockSchemaValidator);
    });
  });

  describe("behaviour", () => {
    beforeEach(async () => {
      mockSchemaValidator.validate.mockReturnValue({ valid: true });
    });
  });
});
