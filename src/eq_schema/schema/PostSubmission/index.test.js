const PostSubmission = require(".");

describe("Post Submission", () => {
  let apiData, context;

  beforeEach(() => {
    apiData = {
      id: "1",
      furtherContent: "<p>Test</p>",
      viewPrintAnswers: true,
      feedback: true,
    };
    context = apiData;
  });

  it("should set the correct data", () => {
    const postSubmission = new PostSubmission(apiData, context);
    expect(postSubmission.guidance).toEqual({
      contents: [
        {
          description: "Test",
        },
      ],
    });
    expect(postSubmission.feedback).toBeTruthy();
    expect(postSubmission.view_response).toBeTruthy();
  });
});
