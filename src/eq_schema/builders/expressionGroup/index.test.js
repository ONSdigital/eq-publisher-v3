const translateAuthorExpressionGroup = require(".");
const { questionnaireJson } = require("../basicQuestionnaireJSON");

describe("expressionGroup", () => {
  it("should translate a complex example correctly", () => {
    const authorExpressionGroup = [
      {
        expressions: [
          {
            left: {
              answerId: "1",
              type: "Answer",
            },
            condition: "Equal",
            right: {
              type: "Custom",
              customValue: {
                number: 5,
              },
            },
          },
        ],
      },
      {
        expressions: [
          {
            left: {
              answerId: "2",
              type: "Answer",
            },
            condition: "OneOf",
            right: {
              type: "SelectedOptions",
              optionIds: ["123", "456"],
            },
          },
        ],
      },
    ];

    const expressionGroup = translateAuthorExpressionGroup(
      authorExpressionGroup,
      { questionnaireJson }
    );
    expect(expressionGroup).toMatchObject([
      {
        when: [
          {
            id: "answer1",
            condition: "equals",
            value: 5,
          },
        ],
      },
      {
        when: [
          {
            id: "answer2",
            condition: "equals any",
            values: ["red", "white"],
          },
        ],
      },
    ]);
  });
});
