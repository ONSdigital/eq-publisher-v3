const Submission = require(".");

describe("Submission with guidance", () => {
  let submission;
  beforeEach(() => {
    submission = {
      id: "07b92a18-180c-4c35-9e94-aa6df9cdee6b",
      furtherContent:
        '<p>Your response will help inform decision-makers how best to support the UK population and economy at this challenging time.</p><p><a href="https://www.ons.gov.uk/surveys" target="_blank" rel="noopener noreferrer">Learn more about how we use this data</a></p>',
      viewPrintAnswers: true,
      emailConfirmation: true,
      feedback: true
    };
  });

  it("should set the correct data", () => {
    const renderSubmission = new Submission(submission);

    expect(renderSubmission.button).toBeTruthy();
    expect(renderSubmission.guidance).toBeTruthy();
    expect(renderSubmission.title).toBeTruthy();
    expect(renderSubmission.warning).toBeTruthy();
  });
});

describe("Submission without guidance", () => {
  let submissionWithout;
  beforeEach(() => {
    submissionWithout = {
      id: "07b92a18-180c-4c35-9e94-aa6df9cdee6b",
      furtherContent:
        '<p>Your response will help inform decision-makers how best to support the UK population and economy at this challenging time.</p><p><a href="https://www.ons.gov.uk/surveys" target="_blank" rel="noopener noreferrer">Learn more about how we use this data</a></p>',
      viewPrintAnswers: false,
      emailConfirmation: true,
      feedback: true
    };
  });

  it("should set the correct data", () => {
    const renderSubmission = new Submission(submissionWithout);

    expect(renderSubmission.button).toBeTruthy();
    expect(renderSubmission.guidance).toBeFalsy();
    expect(renderSubmission.title).toBeTruthy();
    expect(renderSubmission.warning).toBeTruthy();
  });
});
