const Group = require(".");
const Block = require("../Block");

describe("Group", () => {
  const createCtx = (options = {}) => ({
    questionnaireJson: {
      navigation: true,
    },
    ...options,
  });

  const createGroupJSON = (options) =>
    Object.assign(
      {
        id: "1",
        title: "Folder 1",
        introductionTitle: "",
        introductionContent: "",
        pages: [
          {
            id: "2",
            pageType: "QuestionPage",
            answers: [],
          },
        ],
      },
      options
    );

  it("should build valid runner Group from Author section", () => {
    let groupJSON = createGroupJSON();
    const group = new Group(groupJSON.title, groupJSON, createCtx());

    expect(group).toMatchObject({
      id: "group1",
      title: "Folder 1",
      blocks: [expect.any(Block)],
    });
  });

  describe("skip conditions", () => {
    const createGroupsJSON = () => [
      {
        id: 1,
        title: "Group 1",
        pages: [],
        introductionTitle: "",
        introductionContent: "",
      },
      {
        id: 2,
        title: "Group 2",
        pages: [],
        introductionTitle: "",
        introductionContent: "",
      },
      {
        id: 3,
        title: "Group 3",
        pages: [],
        introductionTitle: "",
        introductionContent: "",
      },
    ];

    it("should add skip conditions to the required groups", () => {
      const groupsJson = createGroupsJSON();

      const ctx = createCtx({
        routingGotos: [
          {
            group: "confirmation-group",
            when: {
              id: "answer1",
              condition: "equals",
              value: "Goto End",
            },
            groupId: "group1",
          },
        ],
      });

      const runnerJson = groupsJson.map(
        (group) => new Group(group.title, group, ctx)
      );

      const expectedrunnerJson = [
        { id: "group1", title: "Group 1", blocks: [] },
        {
          id: "group2",
          title: "Group 2",
          blocks: [],
          skip_conditions: [
            { when: { id: "answer1", condition: "equals", value: "Goto End" } },
          ],
        },
        {
          id: "group3",
          title: "Group 3",
          blocks: [],
          skip_conditions: [
            { when: { id: "answer1", condition: "equals", value: "Goto End" } },
          ],
        },
      ];

      expect(runnerJson[0]).not.toHaveProperty("skip_conditions");

      expect(runnerJson).toMatchObject(expectedrunnerJson);
    });

    it("can handle multiple skip conditions for each group", () => {
      const groupsJson = createGroupsJSON();

      const ctx = createCtx({
        routingGotos: [
          {
            group: "confirmation-group",
            when: {
              id: "answer1",
              condition: "equals",
              value: "Goto End",
            },
            groupId: "group1",
          },
          {
            group: "group3",
            when: {
              id: "answer1",
              condition: "equals",
              value: "Goto group3",
            },
            groupId: "group1",
          },
        ],
      });

      const runnerJson = groupsJson.map(
        (group) => new Group(group.title, group, ctx)
      );

      const expectedrunnerJson = [
        { id: "group1", title: "Group 1", blocks: [] },
        {
          id: "group2",
          title: "Group 2",
          blocks: [],
          skip_conditions: [
            { when: { id: "answer1", condition: "equals", value: "Goto End" } },
            {
              when: {
                id: "answer1",
                condition: "equals",
                value: "Goto group3",
              },
            },
          ],
        },
        {
          id: "group3",
          title: "Group 3",
          blocks: [],
          skip_conditions: [
            { when: { id: "answer1", condition: "equals", value: "Goto End" } },
          ],
        },
      ];

      expect(runnerJson).toMatchObject(expectedrunnerJson);
    });
  });

  describe("confirmation pages", () => {
    const ctxGenerator = (routingRuleSet, routing) => ({
      routingGotos: [],
      questionnaireJson: {
        sections: [
          {
            id: "uu1d-iuhiuwfew-fewfewfewdsf-dsf-4",
            title: "<p>Section 1</p>",
            folders: [
              {
                id: "folder-1",
                pages: [
                  {
                    id: "uu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
                    title: "<p>Test question</p>",
                    description: "<p>Test description</p>",
                    descriptionEnabled: true,
                    guidance: null,
                    pageType: "QuestionPage",
                    routingRuleSet,
                    routing,
                    confirmation: {
                      id: "uu1d-iuhiuwfew-fewfewfewdsf-dsf-2",
                      title: "<p>Are you sure?</p>",
                      page: {
                        id: "uu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
                      },
                      positive: {
                        label: "Oh yes.",
                        description: "Positive",
                      },
                      negative: {
                        label: "Wait I can get more?",
                        description: "Negative",
                      },
                    },
                    answers: [
                      {
                        id: "uu1d-iuhiuwfew-fewfewfewdsf-dsf-6",
                        type: "Currency",
                        label: "How much money do you want?",
                        description: "",
                        guidance: "",
                        properties: {
                          decimals: 0,
                          required: false,
                        },
                        qCode: "",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    it("should build a confirmation page", () => {
      const ctx = ctxGenerator(null);

      const resultantJson = new Group(
        "Section 1",
        ctx.questionnaireJson.sections[0].folders[0],
        ctx
      );
      const expectedRunnerBlock = {
        id: "blockconfirmation-page-for-uu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
        type: "ConfirmationQuestion",
        question: {
          id: "questionconfirmation-page-for-uu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
          title: "Are you sure?",
          type: "General",
          answers: [
            {
              id: "answerconfirmation-answer-for-uu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
              mandatory: true,
              type: "Radio",
              options: [
                {
                  label: "Oh yes.",
                  value: "Oh yes.",
                  description: "Positive",
                },
                {
                  label: "Wait I can get more?",
                  value: "Wait I can get more?",
                  description: "Negative",
                },
              ],
            },
          ],
        },
        routing_rules: [
          {
            block: "blockuu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
            when: {
              "==": [
                {
                  identifier:
                    "answerconfirmation-answer-for-uu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
                  source: "answers",
                },
                "Wait I can get more?",
              ],
            },
          },
          {
            group: "confirmation-group",
          },
        ],
      };

      expect(resultantJson.blocks[1]).toMatchObject(expectedRunnerBlock);
    });

    it("should build a confirmation page with qCode", () => {
      const ctx = ctxGenerator(null);
      ctx.questionnaireJson.sections[0].folders[0].pages[0].confirmation.qCode =
        "123";
      const resultantJson = new Group(
        "Section 1",
        ctx.questionnaireJson.sections[0].folders[0],
        ctx
      );
      const expectedRunnerBlock = {
        id: "blockconfirmation-page-for-uu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
        type: "ConfirmationQuestion",
        question: {
          id: "questionconfirmation-page-for-uu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
          title: "Are you sure?",
          type: "General",
          answers: [
            {
              id: "answerconfirmation-answer-for-uu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
              mandatory: true,
              type: "Radio",
              q_code: "123",
              options: [
                {
                  label: "Oh yes.",
                  value: "Oh yes.",
                  description: "Positive",
                },
                {
                  label: "Wait I can get more?",
                  value: "Wait I can get more?",
                  description: "Negative",
                },
              ],
            },
          ],
        },
        routing_rules: [
          {
            block: "blockuu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
            when: {
              "==": [
                {
                  identifier:
                    "answerconfirmation-answer-for-uu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
                  source: "answers",
                },
                "Wait I can get more?",
              ],
            },
          },
          {
            group: "confirmation-group",
          },
        ],
      };

      expect(resultantJson.blocks[1]).toMatchObject(expectedRunnerBlock);
    });

    it("copies a routing from the previous question and converts it to runner format", () => {
      const routing = {
        rules: [
          {
            expressionGroup: {
              operator: "And",
              expressions: [
                {
                  left: {
                    answerId: "1",
                    type: "Answer",
                  },
                  condition: "Equal",
                  right: {
                    customValue: {
                      number: "5",
                    },
                  },
                },
              ],
            },
            destination: {
              sectionId: "uu1d-iuhiuwfew-fewfewfewdsf-dsf-4",
              page: null,
              logical: null,
            },
          },
        ],
        else: {
          section: null,
          page: null,
          logical: "EndOfQuestionnaire",
        },
      };

      const ctx = ctxGenerator(null, routing);

      const resultantJson = new Group(
        "Group Title",
        ctx.questionnaireJson.sections[0].folders[0],
        ctx
      );

      const expectedRunnerRouting = [
        {
          block: "blockuu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
          when: {
            "==": [
              {
                identifier:
                  "answerconfirmation-answer-for-uu1d-iuhiuwfew-fewfewfewdsf-dsf-1",
                source: "answers",
              },
              "Wait I can get more?",
            ],
          },
        },
        {
          group: "groupuu1d-iuhiuwfew-fewfewfewdsf-dsf-4",
          when: {
            and: [
              {
                "==": [
                  {
                    identifier: "answer1",
                    source: "answers",
                  },
                  "5",
                ],
              },
            ],
          },
        },
        {
          group: "confirmation-group",
        },
      ];

      expect(resultantJson.blocks[0].routing_rules).toBeUndefined();
      expect(resultantJson.blocks[1].routing_rules).toEqual(
        expectedRunnerRouting
      );
    });

    it("pipes in checkbox values from the previous questions", () => {
      const ctx = ctxGenerator(null);

      ctx.questionnaireJson.sections[0].folders[0].pages[0].answers[0] = {
        id: "6",
        type: "Checkbox",
        label: "Test",
        description: "",
        guidance: "",
        options: [
          {
            id: "Foo",
            label: "Foo",
          },
          {
            id: "Bar",
            label: "Bar",
          },
          {
            id: "Baz",
            label: "Baz",
          },
        ],
        properties: {
          required: false,
        },
      };

      const folder = ctx.questionnaireJson.sections[0].folders[0];
      const resultantJson = new Group(folder.title, folder, ctx);
      expect(resultantJson.blocks[1].question.description).toEqual([
        `{{ answers['answer${folder.pages[0].answers[0].id}']|format_unordered_list }}`,
      ]);
    });
  });
});
