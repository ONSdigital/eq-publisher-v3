const Submission = require(".");

describe("Submission", () => {
  let apiData, context;

  beforeEach(() => {
    apiData = {
      id: "1",
      furtherContent: "<p>Test</p>",
      viewPrintAnswers: true,
      emailConfirmation: true,
      feedback: true,
    };
    context = apiData;
  });

  it("should set the correct data", () => {
    const submission = new Submission(apiData, context);
    expect(submission.id).toEqual("submission1");
    expect(submission.guidance).toEqual({
      id: "guidance",
      contents: [
        {
          description: "Test",
        },
      ],
    });
    expect(submission.feedback).toBeTruthy();
    expect(submission.view_response).toBeTruthy();
    expect(submission.confirmation_email).toBeTruthy();
  });
});
