const Submission = require(".");

describe("Post Submission", () => {
  let context;

  beforeEach(() => {
    submission = {
      id: "07b92a18-180c-4c35-9e94-aa6df9cdee6b",
      furtherContent:
        '<p>Your response will help inform decision-makers how best to support the UK population and economy at this challenging time.</p><p><a href="https://www.ons.gov.uk/surveys" target="_blank" rel="noopener noreferrer">Learn more about how we use this data</a></p>',
      viewPrintAnswers: true,
      emailConfirmation: true,
      feedback: true
    };

    context = apiData;
  });

  it("should set the correct data", () => {
    const submission = new Submission(submission, context);

    expect(submission.button).toBeTruthy();
    expect(submission.title).toBeTruthy();
    expect(submission.warning).toBeTruthy();
  });
});
