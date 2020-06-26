const translateAuthorRouting = require("./");
const { questionnaireJson } = require("./basicQuestionnaireJSON");
const { AND, OR } = require("../../../constants/routingOperators");

describe("Routing2", () => {
  let routingGotos, ctx;
  beforeEach(() => {
    routingGotos = [];
    ctx = {
      questionnaireJson,
      routingGotos
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
                  type: "Answer"
                },
                condition: "Equal",
                right: {
                  customValue: {
                    number: 5
                  }
                }
              }
            ]
          },
          destination: {
            logical: "NextPage"
          }
        },
        {
          expressionGroup: {
            operator: AND,
            expressions: [
              {
                left: {
                  answerId: "2",
                  type: "Answer"
                },
                condition: "OneOf",
                right: {
                  type: "SelectedOptions",
                  optionIds: [
                    "123", "456"
                  ]
                  
                }
              }
            ]
          },
          destination: {
            logical: "EndOfQuestionnaire"
          }
        }
      ],
      else: {
        pageId: "3"
      }
    };

    const runnerRouting = translateAuthorRouting(authorRouting, "1", "1", ctx);
    expect(ctx.routingGotos).toMatchObject([
      {
        group: "confirmation-group",
        groupId: "group1",
        when: [
          {
            condition: "equals any",
            id: "answer2",
            values: ["red", "white"]
          }
        ]
      }
    ]);

    expect(runnerRouting).toMatchObject([
      {
        goto: {
          block: "block2",
          when: [
            {
              id: "answer1",
              condition: "equals",
              value: 5
            }
          ]
        }
      },
      {
        goto: {
          group: "confirmation-group",
          when: [
            {
              id: "answer2",
              condition: "equals any",
              values: ["red", "white"]
            }
          ]
        }
      },
      {
        goto: {
          block: "block3"
        }
      }
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
                  optionIds: [
                    "123", "456"
                  ]
                }
              }
            ]
          },
          destination: {
            logical: "NextPage"
          }
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
                  optionIds: [
                    "123", "456"
                  ]
                }
              }
            ]
          },
          destination: {
            logical: "EndOfQuestionnaire"
          }
        }
      ],
      else: {
        pageId: "3"
      }
    };
    const runnerRouting = translateAuthorRouting(authorRouting, "1", "1", ctx);
    expect(runnerRouting).toMatchObject([
      {
        goto: {
          block: "block2",
          when: [
            {
              id: "answer1",
              condition: "equals any",
              values: ["red", "white"]
            }
          ]
        }
      },
      {
        goto: {
          group: "confirmation-group",
          when: [
            {
              id: "answer2",
              condition: "equals any",
              values: ["red", "white"]
            }
          ]
        }
      },
      {
        goto: {
          block: "block3"
        }
      }
    ]);
  });
});
