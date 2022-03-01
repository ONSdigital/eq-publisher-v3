const Submission = require(".");

describe("Post Submission", () => {
  let apiData, context;

  beforeEach(() => {
    apiData = {
      id: "1",
      furtherContent: "<p>Test</p>",
      button: "Submit",
      title: "Submit your questionnaire",
      warning: "You cannot view your answers after submission"
    };
    context = apiData;
  });

  it("should set the correct data", () => {
    const submission = new Submission(apiData, context);

    expect(submission.button).toBeTruthy();
    expect(submission.title).toBeTruthy();
    expect(submission.warning).toBeTruthy();
  });
});
