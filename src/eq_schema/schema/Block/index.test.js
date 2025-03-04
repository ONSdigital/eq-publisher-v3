const Block = require(".");
const { isLastPageInSection } = require(".");
const Question = require("../Question");
const ctx = {
  questionnaireJson: {
    id: "1",
    sections: [],
  },
};

describe("Block", () => {
  const createBlockJSON = (block) =>
    Object.assign(
      {
        id: 1,
        pageType: "QuestionPage",
        type: "General",
        answers: [],
      },
      block
    );

  const createPipedFormat = (placeholder, identifier, source) => ({
    text: `{${placeholder}}`,
    placeholders: [
      {
        placeholder,
        value: {
          identifier,
          source,
        },
      },
    ],
  });

  it("should build valid runner Block from Author page", () => {
    const block = new Block(createBlockJSON(), ctx);

    expect(block).toMatchObject({
      // id: "block1",
      question: expect.any(Question),
    });
  });

  it("should not have a title", () => {
    const block = new Block(createBlockJSON(), ctx);

    expect(block.title).toBeUndefined();
  });

  it("should not build routing rules when there is a confirmation page", () => {
    const block = new Block(
      createBlockJSON({
        confirmation: {
          id: "2",
          title: "<p>Are you sure?</p>",
        },
        routing: { id: "2" },
      }),
      ctx
    );

    expect(block.routing_rules).toBeUndefined();
  });

  describe("conversion of page types", () => {
    it("should convert QuestionPage to Questionnaire", () => {
      const block = new Block(
        createBlockJSON({ pageType: "QuestionPage" }),
        ctx
      );
      expect(block.type).toEqual("Question");
    });

    it("should convert InterstitialPage to Interstitial", () => {
      const block = new Block(
        createBlockJSON({ pageType: "InterstitialPage" }),
        ctx
      );

      expect(block.type).toEqual("Interstitial");
    });
  });

  describe("isNotLastPageInSection", () => {
    const questionnaire = {
      sections: [
        {
          pages: [{ id: "1" }, { id: "2" }],
        },
        {
          pages: [{ id: "3" }, { id: "4" }],
        },
      ],
    };

    it("should return true if is a last page", () => {
      expect(isLastPageInSection({ id: "2" }, questionnaire)).toBe(true);
      expect(isLastPageInSection({ id: "4" }, questionnaire)).toBe(true);
    });

    it("should return false if not a last page in a section", () => {
      expect(isLastPageInSection({ id: "1" }, questionnaire)).toBe(false);
      expect(isLastPageInSection({ id: "3" }, questionnaire)).toBe(false);
    });
  });

  describe("piping", () => {
    const createPipeInText = ({
      id = 1,
      text = "foo",
      pipeType = "answers",
    } = {}) => `<span data-piped="${pipeType}" data-id="${id}">${text}</span>`;

    const createPipeInHtml = ({
      id = 1,
      text = "foo",
      pipeType = "answers",
      element = "h2",
    } = {}) =>
      `<${element}><span data-piped="${pipeType}" data-id="${id}">${text}</span></${element}>`;

    const createContext = (
      metadata = [{ id: "123", type: "Text", key: "my_metadata" }]
    ) => ({
      questionnaireJson: {
        metadata,
        sections: [
          {
            folders: [
              {
                id: "folder-1",
                pages: [
                  { answers: [{ id: `1`, label: "Answer 1", type: "Text" }] },
                ],
              },
            ],
          },
        ],
      },
    });

    it("should handle piped values in title", () => {
      const introBlock = Block.buildIntroBlock(
        createPipeInText(),
        "",
        "",
        false,
        createContext()
      );
      expect(introBlock.content.title).toEqual(
        createPipedFormat("answer_1", "answer1", "answers")
      );
    });

    it("should handle piped values in title while stripping html", () => {
      const introBlock = Block.buildIntroBlock(
        createPipeInHtml(),
        "",
        "",
        false,
        createContext()
      );

      expect(introBlock.content.title).toEqual(
        createPipedFormat("answer_1", "answer1", "answers")
      );
    });

    it("should handle piped values in description", () => {
      const introBlock = Block.buildIntroBlock(
        "",
        `<ul>${createPipeInHtml({ element: "li" })}<li>Some Value</li</ul>`,
        "",
        false,
        createContext()
      );
      expect(introBlock.content.contents[0].list).toEqual([
        createPipedFormat("answer_1", "answer1", "answers"),
        "Some Value",
      ]);
    });

    it("should build a calculated summary page", () => {
      const calculatedPageGraphql = {
        id: "1",
        title:
          '<p>Hi is your total <span data-piped="variable"data-id="total">[Total]</span></p>',
        pageType: "CalculatedSummaryPage",
        totalTitle: "<p>Bye</p>",
        summaryAnswers: ["1", "2", "3"],
      };
      const block = new Block(calculatedPageGraphql, null, ctx);
      expect(block).toMatchObject({
        calculation: {
          operation: {
            "+": [
              { source: "answers", identifier: "answer1" },
              { source: "answers", identifier: "answer2" },
              { source: "answers", identifier: "answer3" },
            ],
          },
          title: "Bye",
        },
        id: "1",
        title: "Hi is your total %(total)s",
        type: "CalculatedSummary",
      });
    });

    describe("calculated summary page with and without skip condition", () => {
      ctx.questionnaireJson = {
        metadata: [{ id: "123", type: "Text", key: "my_metadata" }],
        sections: [
          {
            folders: [
              {
                id: "folder-1",
                pages: [
                  {
                    answers: [
                      { id: "num-1", label: "Answer 1", type: "Number" },
                    ],
                    id: "page-1",
                  },
                ],
              },
              {
                displayName: "",
                title: "List1",
                folderId: "792a1b8d-0492-4f5d-ae94-33c9ff8d8a0b",
                listId: "cd9faacd-6d32-4fb1-86ae-7cbf13d633f9",
                pages: [
                  {
                    answers: [
                      {
                        qCode: "q2",
                        label: "",
                        type: "Radio",
                        options: [
                          {
                            qCode: "",
                            label: "Yes",
                            id: "1b947f24-7612-422e-802f-ee3560694266",
                          },
                          {
                            qCode: "",
                            label: "No",
                            id: "0fb66dce-b27c-4db0-af9c-236a1a4a5ed0",
                          },
                        ],
                        id: "4622b458-02b7-457d-90bb-34e2e4fc5861",
                        properties: {
                          required: false,
                        },
                        validation: {},
                      },
                    ],
                    title: "<p>Qualifier1</p>",
                    additionalGuidanceEnabled: false,
                    additionalGuidanceContent: "",
                    pageType: "ListCollectorQualifierPage",
                    pageDescription: "Qualifier page1",
                    alias: null,
                    id: "f5020d43-1ecb-43f7-91f1-408d7aaf5982",
                    position: 0,
                  },
                  {
                    definitionEnabled: false,
                    additionalInfoContent: null,
                    description: null,
                    title: "<p>Add1</p>",
                    definitionLabel: null,
                    additionalInfoLabel: null,
                    pageType: "ListCollectorAddItemPage",
                    descriptionEnabled: false,
                    additionalInfoEnabled: false,
                    definitionContent: null,
                    guidance: null,
                    pageDescription: "Add page1",
                    alias: null,
                    guidanceEnabled: false,
                    id: "a42609e3-83eb-4469-8416-469218d3e779",
                    position: 1,
                  },
                  {
                    definitionEnabled: false,
                    additionalInfoContent: null,
                    answers: [
                      {
                        qCode: "",
                        description: "",
                        label: "<p>Follow1</p>",
                        type: "Number",
                        repeatingLabelAndInputListId: "",
                        repeatingLabelAndInput: false,
                        guidance: "",
                        id: "list-follow-1",
                        questionPageId: "cf8b1c62-e827-4b48-b051-161ae363071c",
                        properties: {
                          required: false,
                          decimals: 0,
                        },
                        validation: {
                          maxValue: {
                            inclusive: true,
                            entityType: "Custom",
                            validationType: "maxValue",
                            enabled: false,
                            id: "4262f139-c8f7-4567-a20d-f65cc6d4acfb",
                          },
                          minValue: {
                            inclusive: true,
                            entityType: "Custom",
                            validationType: "minValue",
                            enabled: false,
                            id: "a97f2945-ebee-46d5-a263-c8683c483876",
                          },
                        },
                      },
                    ],
                    description: "",
                    title: "<p>Follow1</p>",
                    definitionLabel: null,
                    routing: null,
                    additionalInfoLabel: null,
                    pageType: "QuestionPage",
                    descriptionEnabled: false,
                    additionalInfoEnabled: false,
                    definitionContent: null,
                    guidance: null,
                    pageDescription: "Follow page1",
                    alias: null,
                    guidanceEnabled: false,
                    id: "cf8b1c62-e827-4b48-b051-161ae363071c",
                  },
                  {
                    definitionEnabled: false,
                    additionalInfoContent: null,
                    answers: [
                      {
                        qCode: "",
                        description: "",
                        label: "<p>Copy of Follow1</p>",
                        type: "Number",
                        repeatingLabelAndInputListId: "",
                        repeatingLabelAndInput: false,
                        guidance: "",
                        id: "4ce9825e-b48f-4e79-8007-2555a2496fd7",
                        questionPageId: "cf8b1c62-e827-4b48-b051-161ae363071c",
                        properties: {
                          required: false,
                          decimals: 0,
                        },
                        validation: {
                          maxValue: {
                            inclusive: true,
                            entityType: "Custom",
                            validationType: "maxValue",
                            enabled: false,
                            id: "095e5390-9727-4389-ac3b-87560258fa78",
                          },
                          minValue: {
                            inclusive: true,
                            entityType: "Custom",
                            validationType: "minValue",
                            enabled: false,
                            id: "655b1551-33fd-4666-8195-32740530e23a",
                          },
                        },
                      },
                    ],
                    description: "",
                    title: "<p>Copy of Follow1</p>",
                    definitionLabel: null,
                    routing: null,
                    additionalInfoLabel: null,
                    pageType: "QuestionPage",
                    descriptionEnabled: false,
                    additionalInfoEnabled: false,
                    definitionContent: null,
                    guidance: null,
                    pageDescription: "Copy of Follow page1",
                    alias: "",
                    guidanceEnabled: false,
                    id: "ce9cfefe-2761-4a0b-b7c9-93b59b27f8e8",
                  },
                  {
                    answers: [
                      {
                        qCode: "q3",
                        label: "",
                        type: "Radio",
                        options: [
                          {
                            qCode: "",
                            label: "Yes",
                            id: "aa04e6a2-0449-40ce-a84e-301444a705df",
                          },
                          {
                            qCode: "",
                            label: "No",
                            id: "eb4bb680-66c5-49e3-a440-d1028cceac59",
                          },
                        ],
                        id: "a701b7d3-a0f3-4f31-99e3-69e5b8c0311f",
                        properties: {
                          required: false,
                        },
                        validation: {},
                      },
                    ],
                    title: "<p>Confirm1</p>",
                    pageType: "ListCollectorConfirmationPage",
                    pageDescription: "Confirm page1",
                    alias: null,
                    id: "cda52f43-b655-4e89-b7c5-75f038a7369d",
                    position: 2,
                  },
                ],
                alias: "",
                id: "792a1b8d-0492-4f5d-ae94-33c9ff8d8a0b",
              },
              {
                folderId: "f81c792e-5964-486c-8435-4588b74e3af0",
                skipConditions: null,
                pages: [
                  {
                    definitionEnabled: false,
                    additionalInfoContent: null,
                    answers: [
                      {
                        qCode: "q1",
                        description: "",
                        label: "<p>Num1</p>",
                        type: "Number",
                        repeatingLabelAndInputListId: "",
                        repeatingLabelAndInput: false,
                        guidance: "",
                        id: "e8ebdee3-1543-42ef-9a93-9bf092631d43",
                        questionPageId: "2a8e176f-24c2-4196-a376-4d4142fe9154",
                        properties: {
                          required: false,
                          decimals: 0,
                        },
                        validation: {
                          maxValue: {
                            inclusive: true,
                            entityType: "Custom",
                            validationType: "maxValue",
                            enabled: false,
                            id: "2b2372a6-b066-433a-beae-76a101cee089",
                          },
                          minValue: {
                            inclusive: true,
                            entityType: "Custom",
                            validationType: "minValue",
                            enabled: false,
                            id: "f4959f91-eb14-4ee7-b287-cdfd520b121e",
                          },
                        },
                      },
                    ],
                    description: "",
                    title: "<p>Q1</p>",
                    definitionLabel: null,
                    routing: null,
                    additionalInfoLabel: null,
                    pageType: "QuestionPage",
                    descriptionEnabled: false,
                    additionalInfoEnabled: false,
                    definitionContent: null,
                    guidance: null,
                    pageDescription: "Q1",
                    alias: null,
                    guidanceEnabled: false,
                    id: "2a8e176f-24c2-4196-a376-4d4142fe9154",
                  },
                  {
                    definitionEnabled: false,
                    additionalInfoContent: null,
                    answers: [
                      {
                        qCode: "q2",
                        description: "",
                        label: "<p>Copy of Num1</p>",
                        type: "Number",
                        repeatingLabelAndInputListId: "",
                        repeatingLabelAndInput: false,
                        guidance: "",
                        id: "140e55c2-b654-4cad-bc04-40c812514b4e",
                        questionPageId: "2a8e176f-24c2-4196-a376-4d4142fe9154",
                        properties: {
                          required: false,
                          decimals: 0,
                        },
                        validation: {
                          maxValue: {
                            inclusive: true,
                            entityType: "Custom",
                            validationType: "maxValue",
                            enabled: false,
                            id: "60aae247-fdba-4a7b-8f1f-b13df330855e",
                          },
                          minValue: {
                            inclusive: true,
                            entityType: "Custom",
                            validationType: "minValue",
                            enabled: false,
                            id: "261844db-b22b-47f9-8acc-14be09d028b3",
                          },
                        },
                      },
                    ],
                    description: "",
                    title: "<p>Copy of Q1</p>",
                    definitionLabel: null,
                    routing: null,
                    additionalInfoLabel: null,
                    pageType: "QuestionPage",
                    descriptionEnabled: false,
                    additionalInfoEnabled: false,
                    definitionContent: null,
                    guidance: null,
                    pageDescription: "Copy of Q1",
                    alias: "",
                    guidanceEnabled: false,
                    id: "51149541-1595-4d02-b25c-3c60975cd045",
                  },
                  {
                    totalTitle: "<p>Summary1</p>",
                    answers: [
                      {
                        label: "<p>Summary1</p>",
                        type: "Number",
                        id: "e28e4310-a116-447e-bf48-94cbaadd12b6",
                        validation: {},
                        properties: {},
                      },
                    ],
                    title: "<p>Summary1</p>",
                    type: "Number",
                    pageType: "CalculatedSummaryPage",
                    summaryAnswers: [
                      "e8ebdee3-1543-42ef-9a93-9bf092631d43",
                      "140e55c2-b654-4cad-bc04-40c812514b4e",
                    ],
                    pageDescription: "Summary1",
                    alias: null,
                    id: "summary-1",
                  },
                  {
                    definitionEnabled: false,
                    additionalInfoContent: null,
                    answers: [
                      {
                        qCode: "q3",
                        description: "",
                        label: "<p>Copy of Num1</p>",
                        type: "Number",
                        repeatingLabelAndInputListId: "",
                        repeatingLabelAndInput: false,
                        guidance: "",
                        id: "fcfafd8b-c214-4e3d-9a43-10685ce0e2e2",
                        questionPageId: "2a8e176f-24c2-4196-a376-4d4142fe9154",
                        properties: {
                          required: false,
                          decimals: 0,
                        },
                        validation: {
                          maxValue: {
                            inclusive: true,
                            entityType: "Custom",
                            validationType: "maxValue",
                            enabled: false,
                            id: "557d8c18-eb9b-4578-864e-1d732c24d724",
                          },
                          minValue: {
                            inclusive: true,
                            entityType: "Custom",
                            validationType: "minValue",
                            enabled: false,
                            id: "4bc4cac4-1705-4913-98b1-1635e646bc4f",
                          },
                        },
                      },
                    ],
                    description: "",
                    title: "<p>Copy of Copy of Q1</p>",
                    definitionLabel: null,
                    routing: null,
                    additionalInfoLabel: null,
                    pageType: "QuestionPage",
                    descriptionEnabled: false,
                    additionalInfoEnabled: false,
                    definitionContent: null,
                    guidance: null,
                    pageDescription: "Copy of Copy of Q1",
                    alias: "",
                    guidanceEnabled: false,
                    id: "9556866d-e076-4269-aa05-88324e65e641",
                  },
                  {
                    definitionEnabled: false,
                    additionalInfoContent: null,
                    answers: [
                      {
                        qCode: "q4",
                        description: "",
                        label: "<p>Copy of Num1</p>",
                        type: "Number",
                        repeatingLabelAndInputListId: "",
                        repeatingLabelAndInput: false,
                        guidance: "",
                        id: "85cccb63-22eb-4eaf-975c-f933d2ef959f",
                        questionPageId: "2a8e176f-24c2-4196-a376-4d4142fe9154",
                        properties: {
                          required: false,
                          decimals: 0,
                        },
                        validation: {
                          maxValue: {
                            inclusive: true,
                            entityType: "Custom",
                            validationType: "maxValue",
                            enabled: false,
                            id: "e3afc83f-4787-4b74-ade2-513fdb6bd1e9",
                          },
                          minValue: {
                            inclusive: true,
                            entityType: "Custom",
                            validationType: "minValue",
                            enabled: false,
                            id: "9ee56109-0db6-4469-87fb-c6fc35231bbc",
                          },
                        },
                      },
                    ],
                    description: "",
                    title: "<p>Copy of Copy of Copy of Q1</p>",
                    definitionLabel: null,
                    routing: null,
                    additionalInfoLabel: null,
                    pageType: "QuestionPage",
                    descriptionEnabled: false,
                    additionalInfoEnabled: false,
                    definitionContent: null,
                    guidance: null,
                    pageDescription: "Copy of Copy of Copy of Q1",
                    alias: "",
                    guidanceEnabled: false,
                    id: "7a954043-1f2a-456d-9e6e-6a1c2f449abf",
                  },
                  {
                    totalTitle: "<p>Summary2</p>",
                    answers: [
                      {
                        label: "<p>Summary2</p>",
                        type: "Number",
                        id: "45b739e2-bebb-4fcb-8e6e-17b29e4dff24",
                        validation: {},
                        properties: {},
                      },
                    ],
                    title: "<p>Summary2</p>",
                    type: "Number",
                    pageType: "CalculatedSummaryPage",
                    summaryAnswers: [
                      "fcfafd8b-c214-4e3d-9a43-10685ce0e2e2",
                      "85cccb63-22eb-4eaf-975c-f933d2ef959f",
                    ],
                    pageDescription: "Summary2",
                    alias: null,
                    id: "summary-2",
                  },
                  {
                    totalTitle: "<p>Grand summary</p>",
                    answers: [
                      {
                        label: "<p>Grand summary</p>",
                        type: "Number",
                        id: "3ffa4535-3e07-47e6-87ac-b8b56da823e1",
                        validation: {},
                        properties: {},
                      },
                    ],
                    title: "<p>Grand summary</p>",
                    type: "Number",
                    pageType: "CalculatedSummaryPage",
                    summaryAnswers: [
                      "e28e4310-a116-447e-bf48-94cbaadd12b6",
                      "45b739e2-bebb-4fcb-8e6e-17b29e4dff24",
                    ],
                    pageDescription: "Grand summary",
                    alias: null,
                    id: "grand-summary-1",
                  },
                ],
                alias: "Folder1",
                id: "f81c792e-5964-486c-8435-4588b74e3af0",
              },
            ],
          },
        ],
      };
      it("should build a calculated summary page with skip condition when it contains only one list collector follow up answer", () => {
        const calculatedPageGraphql = {
          totalTitle: "<p>Summary title1</p>",
          answers: [
            {
              label: "<p>Summary title1</p>",
              type: "Number",
              id: "9d2b3354-9751-4be4-9523-1f36345c3069",
              validation: {},
              properties: {},
            },
          ],
          title: "<p>Summary1</p>",
          type: "Number",
          pageType: "CalculatedSummaryPage",
          summaryAnswers: ["list-follow-1"],
          pageDescription: "Summary page1",
          alias: null,
          id: "summary-page1",
          listId: undefined,
        };

        const block = new Block(calculatedPageGraphql, null, ctx);

        expect(block).toMatchObject({
          id: "summary-page1",
          type: "CalculatedSummary",
          page_title: "Summary page1",
          title: "Summary1",
          calculation: {
            operation: {
              "+": [
                {
                  identifier: "answerlist-follow-1",
                  source: "answers",
                },
              ],
            },
            title: "Summary title1",
          },
          skip_conditions: {
            when: {
              in: [
                {
                  source: "answers",
                  identifier: "answer4622b458-02b7-457d-90bb-34e2e4fc5861",
                },
                ["No"],
              ],
            },
          },
        });
      });

      it("should build a calculated summary page without skip condition when it contains a normal answer", () => {
        const calculatedPageGraphql = {
          totalTitle: "<p>Summary title1</p>",
          answers: [
            {
              label: "<p>Summary title1</p>",
              type: "Number",
              id: "9d2b3354-9751-4be4-9523-1f36345c3069",
              validation: {},
              properties: {},
            },
          ],
          title: "<p>Summary1</p>",
          type: "Number",
          pageType: "CalculatedSummaryPage",
          summaryAnswers: ["num-1"],
          pageDescription: "Summary page1",
          alias: null,
          id: "summary-page1",
          listId: undefined,
        };

        const block = new Block(calculatedPageGraphql, null, ctx);

        expect(block).toMatchObject({
          id: "summary-page1",
          type: "CalculatedSummary",
          page_title: "Summary page1",
          title: "Summary1",
          calculation: {
            operation: {
              "+": [
                {
                  identifier: "answernum-1",
                  source: "answers",
                },
              ],
            },
            title: "Summary title1",
          },
        });
      });
    });

    describe("grand calculated summary page", () => {
      it("should build a grand calculated summary page", () => {
        const calculatedPageGraphql = {
          totalTitle: "<p>Grand summary</p>",
          answers: [
            {
              label: "<p>Grand summary</p>",
              type: "Number",
              id: "3ffa4535-3e07-47e6-87ac-b8b56da823e1",
              validation: {},
              properties: {},
            },
          ],
          title: "<p>Grand summary</p>",
          type: "Number",
          pageType: "CalculatedSummaryPage",
          summaryAnswers: [
            "e28e4310-a116-447e-bf48-94cbaadd12b6",
            "45b739e2-bebb-4fcb-8e6e-17b29e4dff24",
          ],
          pageDescription: "Grand summary",
          alias: null,
          id: "grand-summary-1",
        };

        const block = new Block(calculatedPageGraphql, null, ctx);

        expect(block).toMatchObject({
          id: "grand-summary-1",
          type: "GrandCalculatedSummary",
          page_title: "Grand summary",
          title: "Grand summary",
          calculation: {
            operation: {
              "+": [
                {
                  identifier: "summary-1",
                  source: "calculated_summary",
                },
                {
                  identifier: "summary-2",
                  source: "calculated_summary",
                },
              ],
            },
            title: "Grand summary",
          },
        });
      });
    });
  });
});
