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
});
