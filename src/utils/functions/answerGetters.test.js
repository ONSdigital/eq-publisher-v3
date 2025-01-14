const { getAnswerById } = require("./answerGetters");

describe("getAnswerById", () => {
  it("should return an answer by id", () => {
    const ctx = {
      questionnaireJson: {
        sections: [
          {
            folders: [
              {
                pages: [
                  {
                    answers: [
                      {
                        id: "1",
                        label: "Answer 1",
                      },
                      {
                        id: "2",
                        label: "Answer 2",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    expect(getAnswerById(ctx, "2")).toMatchObject({
      id: "2",
      label: "Answer 2",
    });
  });

  it("should return an answer by id when questionnaire contains pages without answers", () => {
    const ctx = {
      questionnaireJson: {
        sections: [
          {
            id: "section-1",
            folders: [
              {
                id: "folder-1",
                pages: [
                  {
                    id: "page-1",
                    answers: [
                      {
                        id: "answer-1",
                        label: "Answer 1",
                      },
                    ],
                  },
                  {
                    id: "page-2",
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    expect(getAnswerById(ctx, "answer-1")).toMatchObject({
      id: "answer-1",
      label: "Answer 1",
    });
  });
});
