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
            logical: "NextPage",
          },
        },
      ],
      else: {
        pageId: "3",
      },
    };

    const runnerRouting = translateAuthorRouting(
      authorRouting,
      "1",
      "1",
      "routing",
      ctx
    );

    expect(runnerRouting).toMatchObject([
      {
        block: "block2",
        when: {
          and: [
            {
              "==": [
                {
                  identifier: "answer1",
                  source: "answers",
                },
                5,
              ],
            },
            {
              "in": [
                {
                  identifier: "answer2",
                  source: "answers",
                },
                ["red", "white"],
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
            logical: "NextPage",
          },
        },
      ],
      else: {
        pageId: "3",
      },
    };
    const runnerRouting = translateAuthorRouting(
      authorRouting,
      "1",
      "1",
      "routing",
      ctx
    );
    expect(runnerRouting).toMatchObject([
      {
        block: "block2",
        when: {
          or: [
            {
              "in": [
                {
                  identifier: "answer1",
                  source: "answers",
                },
                ["red", "white"],
              ],
            },
            {
              "in": [
                {
                  identifier: "answer2",
                  source: "answers",
                },
                ["red", "white"],
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

describe("Testing Skip Condition Logic", () => {
  let routingGotos, ctx;
  beforeEach(() => {
    routingGotos = [];
    ctx = {
      questionnaireJson,
      routingGotos,
    };
  });

  it("should translate a skip condition correctly for a number comparison", () => {
    const authorRouting = [
      {
        expressions: [
          {
            right: {
              customValue: {
                number: 1,
              },
              type: "Custom",
            },
            condition: "Equal",
            left: {
              answerId: "b712c8a0-e706-4754-90c1-57e5c7827d53",
              type: "Answer",
            },
            id: "2630ce0d-2c97-4b81-804b-083b1b4ba21b",
          },
        ],
        operator: "And",
        id: "ae2dcb59-c51e-4d98-88f5-f7cb5e878851",
      },
    ];
    const runnerRouting = translateAuthorRouting(
      authorRouting,
      "1",
      "1",
      "skip",
      ctx
    );
    expect(runnerRouting).toMatchObject({
      when: {
        "==": [
          {
            source: "answers",
            identifier: "answerb712c8a0-e706-4754-90c1-57e5c7827d53",
          },
          1,
        ],
      },
    });
  });

  it("should translate a skip condition  equality comparison correctly.", () => {
    const authorRouting = [
      {
        expressions: [
          {
            secondaryCondition: "Equal",
            right: {
              customValue: {
                number: 3,
              },
              type: "Custom",
            },
            condition: "CountOf",
            left: {
              answerId: "2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
              type: "Answer",
            },
            id: "2630ce0d-2c97-4b81-804b-083b1b4ba21b",
          },
        ],
        operator: "And",
        id: "ae2dcb59-c51e-4d98-88f5-f7cb5e878851",
      },
    ];

    const runnerRouting = translateAuthorRouting(
      authorRouting,
      "1",
      "1",
      "skip",
      ctx
    );
    expect(runnerRouting).toMatchObject({
      when: {
        "==": [
          {
            count: [
              {
                source: "answers",
                identifier: "answer2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
              },
            ],
          },
          3,
        ],
      },
    });
  });

  it("should translate a skip condition  non equality comparison correctly.", () => {
    const authorRouting = [
      {
        expressions: [
          {
            secondaryCondition: "NotEqual",
            right: {
              customValue: {
                number: 3,
              },
              type: "Custom",
            },
            condition: "CountOf",
            left: {
              answerId: "2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
              type: "Answer",
            },
            id: "2630ce0d-2c97-4b81-804b-083b1b4ba21b",
          },
        ],
        operator: "And",
        id: "ae2dcb59-c51e-4d98-88f5-f7cb5e878851",
      },
    ];

    const runnerRouting = translateAuthorRouting(
      authorRouting,
      "1",
      "1",
      "skip",
      ctx
    );
    expect(runnerRouting).toMatchObject({
      when: {
        "!=": [
          {
            count: [
              {
                source: "answers",
                identifier: "answer2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
              },
            ],
          },
          3,
        ],
      },
    });
  });

  it("should translate a skip condition  greater or equality comparison correctly.", () => {
    const authorRouting = [
      {
        expressions: [
          {
            secondaryCondition: "GreaterOrEqual",
            right: {
              customValue: {
                number: 3,
              },
              type: "Custom",
            },
            condition: "CountOf",
            left: {
              answerId: "2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
              type: "Answer",
            },
            id: "2630ce0d-2c97-4b81-804b-083b1b4ba21b",
          },
        ],
        operator: "And",
        id: "ae2dcb59-c51e-4d98-88f5-f7cb5e878851",
      },
    ];

    const runnerRouting = translateAuthorRouting(
      authorRouting,
      "1",
      "1",
      "skip",
      ctx
    );
    expect(runnerRouting).toMatchObject({
      when: {
        ">=": [
          {
            count: [
              {
                source: "answers",
                identifier: "answer2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
              },
            ],
          },
          3,
        ],
      },
    });
  });

  it("should translate a skip condition  less than or equality comparison correctly.", () => {
    const authorRouting = [
      {
        expressions: [
          {
            secondaryCondition: "LessOrEqual",
            right: {
              customValue: {
                number: 3,
              },
              type: "Custom",
            },
            condition: "CountOf",
            left: {
              answerId: "2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
              type: "Answer",
            },
            id: "2630ce0d-2c97-4b81-804b-083b1b4ba21b",
          },
        ],
        operator: "And",
        id: "ae2dcb59-c51e-4d98-88f5-f7cb5e878851",
      },
    ];

    const runnerRouting = translateAuthorRouting(
      authorRouting,
      "1",
      "1",
      "skip",
      ctx
    );
    expect(runnerRouting).toMatchObject({
      when: {
        "<=": [
          {
            count: [
              {
                source: "answers",
                identifier: "answer2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
              },
            ],
          },
          3,
        ],
      },
    });
  });

  it("should translate a skip condition more than comparison correctly.", () => {
    const authorRouting = [
      {
        expressions: [
          {
            secondaryCondition: "GreaterThan",
            right: {
              customValue: {
                number: 3,
              },
              type: "Custom",
            },
            condition: "CountOf",
            left: {
              answerId: "2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
              type: "Answer",
            },
            id: "2630ce0d-2c97-4b81-804b-083b1b4ba21b",
          },
        ],
        operator: "And",
        id: "ae2dcb59-c51e-4d98-88f5-f7cb5e878851",
      },
    ];

    const runnerRouting = translateAuthorRouting(
      authorRouting,
      "1",
      "1",
      "skip",
      ctx
    );
    expect(runnerRouting).toMatchObject({
      when: {
        ">": [
          {
            count: [
              {
                source: "answers",
                identifier: "answer2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
              },
            ],
          },
          3,
        ],
      },
    });
  });

  it("should translate a skip condition less than comparison correctly.", () => {
    const authorRouting = [
      {
        expressions: [
          {
            secondaryCondition: "LessThan",
            right: {
              customValue: {
                number: 3,
              },
              type: "Custom",
            },
            condition: "CountOf",
            left: {
              answerId: "2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
              type: "Answer",
            },
            id: "2630ce0d-2c97-4b81-804b-083b1b4ba21b",
          },
        ],
        operator: "And",
        id: "ae2dcb59-c51e-4d98-88f5-f7cb5e878851",
      },
    ];

    const runnerRouting = translateAuthorRouting(
      authorRouting,
      "1",
      "1",
      "skip",
      ctx
    );
    expect(runnerRouting).toMatchObject({
      when: {
        "<": [
          {
            count: [
              {
                source: "answers",
                identifier: "answer2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
              },
            ],
          },
          3,
        ],
      },
    });
  });

  it("should translate a skip condition checkbox any of correctly.", () => {
    const authorRouting = [
      {
        expressions: [
          {
            right: {
              customValue: {
                number: 3,
              },
              type: "SelectedOptions",
              optionIds: ["123", "456"],
            },
            condition: "AnyOf",
            left: {
              answerId: "2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
              type: "Answer",
            },
            id: "2630ce0d-2c97-4b81-804b-083b1b4ba21b",
          },
        ],
        operator: "And",
        id: "ae2dcb59-c51e-4d98-88f5-f7cb5e878851",
      },
    ];

    const runnerRouting = translateAuthorRouting(
      authorRouting,
      "1",
      "1",
      "skip",
      ctx
    );
    expect(runnerRouting).toMatchObject({
      when: {
        "any-in": [
          ["red", "white"],
          {
            identifier: "answer2ff2ad6c-04ec-45c6-bff1-6a441abb6685",
            source: "answers",
          },
        ],
      },
    });
  });

  it("should translate a skip condition checkbox not any of correctly.", () => {
    const authorRouting = [
      {
        expressions: [
          {
            right: {
              type: "SelectedOptions",
              optionIds: ["123", "456"],
            },
            condition: "NotAnyOf",
            left: {
              answerId: "56f21ba7-96e8-4e95-815b-f38806c243a5",
              type: "Answer",
            },
            id: "e820f8cb-15d3-4178-a66c-a410620dd476",
          },
        ],
        operator: "And",
        id: "200010d0-c045-4383-8d49-c65359cfc2b4",
      },
    ];

    const runnerRouting = translateAuthorRouting(
      authorRouting,
      "1",
      "1",
      "skip",
      ctx
    );
    expect(runnerRouting).toMatchObject({
      when: {
        not: [
          {
            "any-in": [
              ["red", "white"],
              {
                identifier: "answer56f21ba7-96e8-4e95-815b-f38806c243a5",
                source: "answers",
              },
            ],
          },
        ],
      },
    });
  });

  it("should translate a skip condition checkbox with an or Radio / checkbox option correctly.", () => {
    const authorRouting = [
      {
        expressions: [
          {
            secondaryCondition: null,
            right: {
              type: "SelectedOptions",
              optionIds: ["123"],
            },
            condition: "OneOf",
            left: {
              answerId: "27b51b6f-3ada-4b8c-88db-33e21e13172f",
              type: "Answer",
            },
            id: "a2008e59-f979-416d-9324-bf3e43256778",
          },
        ],
        operator: "And",
        id: "385e7fa3-bd2b-42ab-ab62-82d79ec4bf96",
      },
      {
        expressions: [
          {
            right: {},
            condition: "Unanswered",
            left: {
              answerId: "27b51b6f-3ada-4b8c-88db-33e21e13172f",
              type: "Answer",
            },
            id: "1dac9a90-b54f-41b2-9c63-1bda527d4481",
          },
        ],
        operator: "And",
        id: "61ec6722-3ce6-454f-9e1a-4ef8ebe4dd47",
      },
    ];

    const runnerRouting = translateAuthorRouting(
      authorRouting,
      "1",
      "1",
      "skip",
      ctx
    );
    expect(runnerRouting).toMatchObject({
      when: {
        or: [
          {
            "in": [
              {
                identifier: "answer27b51b6f-3ada-4b8c-88db-33e21e13172f",
                source: "answers",
              },
              ["red"],
            ],
          },
          {
            "==": [
              {
                source: "answers",
                identifier: "answer27b51b6f-3ada-4b8c-88db-33e21e13172f",
              },
              null,
            ],
          },
        ],
      },
    });
  });
});
