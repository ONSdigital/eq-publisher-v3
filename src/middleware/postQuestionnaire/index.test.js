const postQuestionnaire = require(".");

describe("PostQuestionnaire", () => {
  let req, res, next, questionnaire;
  let middleware; // eslint-disable-line no-unused-vars
  beforeEach(() => {
    questionnaire = {
      id: "123",
      title: "Survey"
    };
    req = {
      body: {}
    };
    res = {
      sendStatus: jest.fn(),
      locals: {}
    };
    next = jest.fn();
  });

  it("should return an error with invalid JSON", () => {
    middleware = postQuestionnaire(req, res, next);
    expect(res.sendStatus).toHaveBeenCalled();
  });

  it("should move to next if successful", () => {
    req.body = questionnaire;

    middleware = postQuestionnaire(req, res, next);

    expect(res.locals.questionnaire).toEqual(questionnaire);
    expect(next).toHaveBeenCalled();
  });
});
