const schemaConverter = require(".");

describe("schemaConverter", () => {
  let res, req, next, questionnaire;

  beforeEach(() => {
    questionnaire = require("../../../test.json");
    res = {
      locals: questionnaire
    };

    req = jest.fn();
    next = jest.fn();
    schemaConverter(req, res, next);
  });

  it("should pass data through", () => {
    expect(next).toHaveBeenCalledWith();
  });
});
