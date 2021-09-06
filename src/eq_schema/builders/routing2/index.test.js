const translateAuthorRouting = require("./");
const { questionnaireJson } = require("../basicQuestionnaireJSON");
const { AND, OR } = require("../../../constants/routingOperators");

describe("Routing2", () => {
  let routingGotos, ctx;
  beforeEach(() => {
    routingGotos = [];
    ctx = {
      questionnaireJson,
      routingGotos,
    };
  });
  it("should translate a complex example with 'And' correctly", () => {
    const authorRouting = {
      rules: [
        {
          expressionGroup: {
            operator: AND,
            expressions: [
              {
                left: {
                  answerId: "1",
                  type: "Answer",
                },
                condition: "Equal",
                right: {
                  customValue: {
                    number: 5,
                  },
                },
              },
            ],
          },
          destination: {
            logical: "NextPage",
          },
        },
        {
          expressionGroup: {
            operator: AND,
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
          destination: {
            logical: "EndOfQuestionnaire",
          },
        },
      ],
      else: {
        pageId: "3",
      },
    };

    const runnerRouting = translateAuthorRouting(authorRouting, "1", "1", ctx);
    expect(ctx.routingGotos).toMatchObject([
      {
        group: "confirmation-group",
        groupId: "group1",
        when: {
          and: [
            {
              "any-in": [
                {
                  identifier: "answer2",
                  values: ["red", "white"],
                },
              ],
            },
          ],
        },
      },
    ]);

    expect(runnerRouting).toMatchObject([
      {
        block: "block2",
        when: {
          and: [
            {
              "==": [
                {
                  identifier: "answer1",
                  source: "Answer",
                },
                5,
              ],
            },
          ],
        },
      },
      {
        group: "confirmation-group",
        when: {
          and: [
            {
              "any-in": [
                {
                  identifier: "answer2",
                  values: ["red", "white"],
                },
              ],
            },
          ],
        },
      },
      {
        block: "block3",
      },
    ]);
  });

  it("should translate example with 'Or' correctly", () => {
    const authorRouting = {
      rules: [
        {
          expressionGroup: {
            operator: OR,
            expressions: [
              {
                left: {
                  answerId: "1",
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
          destination: {
            logical: "NextPage",
          },
        },
        {
          expressionGroup: {
            operator: OR,
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
          destination: {
            logical: "EndOfQuestionnaire",
          },
        },
      ],
      else: {
        pageId: "3",
      },
    };
    const runnerRouting = translateAuthorRouting(authorRouting, "1", "1", ctx);
    expect(runnerRouting).toMatchObject([
      {
        block: "block2",
        when: {
          or: [
            {
              "any-in": [
                {
                  identifier: "answer1",
                  values: ["red", "white"],
                },
              ],
            },
          ],
        },
      },
      {
        group: "confirmation-group",
        when: {
          or: [
            {
              "any-in": [
                {
                  identifier: "answer2",
                  values: ["red", "white"],
                },
              ],
            },
          ],
        },
      },
      {
        block: "block3",
      },
    ]);
  });
});
