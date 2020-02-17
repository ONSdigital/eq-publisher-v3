const schemaConverter = require(".");

describe("schemaConverter", () => {
  let res, req, next, middleware, questionnaire;

  beforeEach(() => {
    questionnaire = require("../../../test.json");
    res = {
      locals: questionnaire
    };

    req = jest.fn();
    next = jest.fn();
    middleware = schemaConverter(req, res, next);
  });

  it("should pass data through", () => {
    expect(next).toHaveBeenCalledWith();
  });
});
