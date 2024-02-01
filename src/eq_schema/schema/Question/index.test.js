const { set, last, cloneDeep } = require("lodash/fp");
const { remove } = require("lodash");
const { DATE, DATE_RANGE, NUMBER } = require("../../../constants/answerTypes");

const Question = require(".");
const Answer = require("../Answer");

describe("Question", () => {
  const createQuestionJSON = (options) =>
    Object.assign(
      {
        id: 1,
        title: "question title",
        description: "question description",
        pageDescription: "Question page title",
        type: "General",
        answers: [
          {
            id: "1",
            properties: {
              required: true,
            },
          },
        ],
      },
      options
    );

  const ctx = {
    questionnaireJson: {
      title: "Test Questionnaire",
      dataVersion: "1",
      collectionLists: {
        lists: [{ id: "list-1" }],
      },
      sections: [
        {
          folders: [
            {
              pages: [
                {
                  id: "123",
                  pageType: "QuestionPage",
                  answers: [
                    {
                      id: "20",
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

  it("should construct a valid eQ runner question from an author question", () => {
    const question = new Question(createQuestionJSON(), ctx);

    expect(question).toMatchObject({
      id: "question1",
      title: "question title",
      type: "General",
      answers: [expect.any(Answer)],
    });
  });

  it("should handle HTML values", () => {
    const question = new Question(
      createQuestionJSON({
        title: "<p>question title</p>",
      }),
      ctx
    );

    expect(question).toMatchObject({
      title: "question title",
    });
  });

  describe("description", () => {
    describe("when there is content and enabled", () => {
      it("should be populated", () => {
        const question = new Question(
          createQuestionJSON({
            description: "<h2>hello world</h2>",
            descriptionEnabled: true,
          }),
          ctx
        );
        expect(question.description).toBeDefined();
      });
    });

    describe("when it is disabled", () => {
      it("should be undefined", () => {
        const question = new Question(
          createQuestionJSON({ descriptionEnabled: false }),
          ctx
        );
        expect(question.description).toBeUndefined();
      });
    });

    describe("when there is no content", () => {
      it("should be undefined", () => {
        const question = new Question(createQuestionJSON(), ctx);
        expect(question.description).toBeUndefined();
      });
    });
  });

  describe("guidance", () => {
    describe("when there is content and enabled", () => {
      it("should be populated", () => {
        const question = new Question(
          createQuestionJSON({
            guidance: "<h2>hello world</h2>",
            guidanceEnabled: true,
          }),
          ctx
        );
        expect(question.guidance).toBeDefined();
      });
    });

    describe("when it is disabled", () => {
      it("should be undefined", () => {
        const question = new Question(
          createQuestionJSON({ guidanceEnabled: false }),
          ctx
        );
        expect(question.guidance).toBeUndefined();
      });
    });

    describe("when there is no content", () => {
      it("should be undefined", () => {
        const question = new Question(createQuestionJSON(), ctx);
        expect(question.guidance).toBeUndefined();
      });
    });
  });

  describe("definitions", () => {
    describe("when there is content and enabled", () => {
      it("should be populated when both label and content", () => {
        const question = new Question(
          createQuestionJSON({
            definitionLabel: "definition label",
            definitionContent: "<p>definition content</p>",
            definitionEnabled: true,
          }),
          ctx
        );
        expect(question.definitions).toBeDefined();
      });
      it("should be populated when label and no content", () => {
        const question = new Question(
          createQuestionJSON({
            definitionLabel: "definition label",
            definitionContent: "",
            definitionEnabled: true,
          }),
          ctx
        );
        expect(question.definitions).toBeDefined();
      });
      it("should be populated when no label and content", () => {
        const question = new Question(
          createQuestionJSON({
            definitionLabel: "",
            definitionContent: "<p>definition content</p>",
            definitionEnabled: true,
          }),
          ctx
        );
        expect(question.definitions).toBeDefined();
      });
    });

    describe("when it is disabled", () => {
      it("should be undefined ", () => {
        const question = new Question(
          createQuestionJSON({
            definitionLabel: "",
            definitionContent: "",
            definitionEnabled: false,
          }),
          ctx
        );
        expect(question.definitions).toBeUndefined();
      });
    });

    describe("when there is no content", () => {
      it("should be undefined when neither label or content", () => {
        const question = new Question(
          createQuestionJSON({
            definitionLabel: "",
            definitionContent: "",
          }),
          ctx
        );
        expect(question.definitions).toBeUndefined();
      });
    });
  });

  describe("additional information", () => {
    describe("when there is content and enabled", () => {
      it("should be populated when both label and content", () => {
        const question = new Question(
          createQuestionJSON({
            additionalInfoLabel: "additionalInfo label",
            additionalInfoContent: "<p>additionalInfo content</p>",
            additionalInfoEnabled: true,
          }),
          ctx
        );
        expect(last(question.answers).guidance).toBeDefined();
        expect(last(question.answers).guidance.show_guidance).toBeDefined();
        expect(last(question.answers).guidance.hide_guidance).toBeDefined();
        expect(last(question.answers).guidance.contents).toBeDefined();
      });
      it("should be populated when label and no content", () => {
        const question = new Question(
          createQuestionJSON({
            additionalInfoLabel: "additionalInfo label",
            additionalInfoContent: "",
            additionalInfoEnabled: true,
          }),
          ctx
        );
        expect(last(question.answers).guidance).toBeDefined();
        expect(last(question.answers).guidance.show_guidance).toBeDefined();
        expect(last(question.answers).guidance.hide_guidance).toBeDefined();
        expect(last(question.answers).guidance.contents).toBeUndefined();
      });
      it("should be populated when no label and content", () => {
        const question = new Question(
          createQuestionJSON({
            additionalInfoLabel: "",
            additionalInfoContent: "<p>additionalInfo content</p>",
            additionalInfoEnabled: true,
          }),
          ctx
        );
        expect(last(question.answers).guidance).toBeDefined();
        expect(last(question.answers).guidance.show_guidance).toBeFalsy();
        expect(last(question.answers).guidance.hide_guidance).toBeFalsy();
        expect(last(question.answers).guidance.contents).toBeDefined();
      });

      it("should throw an error when no answers on the page", () => {
        expect(
          () =>
            new Question(
              createQuestionJSON({
                additionalInfoLabel: "Additional info",
                additionalInfoContent: "<p>Additional info content</p>",
                additionalInfoEnabled: true,
                answers: [],
              }),
              ctx
            )
        ).toThrow(/no answers/);
      });
    });

    describe("when it is disabled", () => {
      it("should be undefined", () => {
        const question = new Question(
          createQuestionJSON({
            definitionLabel: "",
            definitionContent: "",
            additionalInfoEnabled: false,
          }),
          ctx
        );
        expect(last(question.answers).guidance).toBeUndefined();
      });
    });

    describe("when there is no content", () => {
      it("should be undefined when neither label or content", () => {
        const question = new Question(
          createQuestionJSON({
            definitionLabel: "",
            definitionContent: "",
          }),
          ctx
        );
        expect(last(question.answers).guidance).toBeUndefined();
      });
    });
  });

  describe("DateRange", () => {
    let validation = {};
    beforeEach(() => {
      validation = {
        earliestDate: {
          id: "1",
          enabled: true,
          custom: "2017-02-17",
          offset: {
            value: 4,
            unit: "Days",
          },
          relativePosition: "Before",
        },
        latestDate: {
          id: "2",
          enabled: true,
          custom: "2018-02-17",
          offset: {
            value: 10,
            unit: "Years",
          },
          relativePosition: "After",
        },
        minDuration: {
          id: "3",
          enabled: true,
          duration: {
            value: 13,
            unit: "Days",
          },
        },
        maxDuration: {
          id: "4",
          enabled: true,
          duration: {
            value: 2,
            unit: "Months",
          },
        },
      };
    });

    it("should convert Author DateRange to Runner-compatible format", () => {
      const answers = [
        {
          type: DATE_RANGE,
          id: "answer1",
          label: "Period from",
          secondaryLabel: "Period to",
          properties: { required: true },
          validation,
        },
      ];
      const question = new Question(createQuestionJSON({ answers }), ctx);

      expect(question).toMatchObject({
        type: DATE_RANGE,
        answers: [
          {
            label: "Period from",
            type: DATE,
            id: "answeranswer1from",
            mandatory: true,
          },
          {
            label: "Period to",
            type: DATE,
            id: "answeranswer1to",
            mandatory: true,
          },
        ],
      });
    });

    it("discards any other answers if DateRange used", () => {
      const answers = [
        {
          type: DATE_RANGE,
          id: "1",
          properties: { required: true },
          validation,
          childAnswers: [
            { id: "1from", label: "Period from" },
            { id: "1to", label: "Period to" },
          ],
        },
        { type: "TextField", id: "2" },
      ];
      const question = new Question(createQuestionJSON({ answers }), ctx);

      expect(question.answers).not.toContainEqual(
        expect.objectContaining({
          type: "TextField",
        })
      );
    });

    it("should create additionalAnswer answer if exists", () => {
      const answers = [
        {
          type: "Checkbox",
          id: "1",
          properties: { required: true },
          validation,
          options: [
            {
              id: "1",
              label: "Option 1",
            },
            {
              id: "2",
              label: "additionalAnswer option",
              additionalAnswer: {
                id: "3",
                type: "TextField",
                label: "please describe",
                properties: { required: true },
              },
            },
          ],
        },
      ];
      const question = new Question(createQuestionJSON({ answers }), ctx);

      expect(question.answers[0].options).toHaveLength(2);
      expect(question.answers[0].options[1]).toMatchObject({
        detail_answer: {
          id: "answer3",
          mandatory: true,
          type: "TextField",
        },
      });
    });

    it("should not create other answer if other property is nil", () => {
      const answers = [
        {
          type: "Checkbox",
          id: "1",
          properties: { required: true },
          validation,
          options: [
            {
              id: "1",
              label: "Option 1",
            },
          ],
          other: null,
        },
      ];
      const question = new Question(createQuestionJSON({ answers }), ctx);

      expect(question.answers).toEqual([
        expect.objectContaining({
          type: "Checkbox",
        }),
      ]);
    });

    it("should create date validation", () => {
      const answers = [
        {
          type: DATE_RANGE,
          id: "1",
          advancedProperties: true,
          properties: { required: true },
          validation,
          childAnswers: [
            { id: "1from", label: "Period from" },
            { id: "1to", label: "Period to" },
          ],
        },
      ];
      const question = new Question(createQuestionJSON({ answers }), ctx);

      expect(question.answers[0]).toEqual(
        expect.objectContaining({
          minimum: {
            value: "2017-02-17",
            offset_by: {
              days: -4,
            },
          },
        })
      );
      expect(question.answers[1]).toEqual(
        expect.objectContaining({
          maximum: {
            value: "2018-02-17",
            offset_by: {
              years: 10,
            },
          },
        })
      );
      expect(question.period_limits).toEqual(
        expect.objectContaining({
          minimum: {
            days: 13,
          },
        })
      );
      expect(question.period_limits).toEqual(
        expect.objectContaining({
          maximum: {
            months: 2,
          },
        })
      );
    });

    it("should not create date validation", () => {
      const answers = [
        {
          type: DATE_RANGE,
          id: "1",
          properties: { required: true },
          validation,
          childAnswers: [
            { id: "1from", label: "Period from" },
            { id: "1to", label: "Period to" },
          ],
        },
      ];
      answers[0].validation.earliestDate.enabled = false;
      answers[0].validation.latestDate.enabled = false;
      answers[0].validation.minDuration.enabled = false;
      answers[0].validation.maxDuration.enabled = false;
      const question = new Question(createQuestionJSON({ answers }), ctx);

      expect(question.answers[0]).toEqual(
        expect.not.objectContaining({
          minimum: {
            value: "2017-02-17",
            offset_by: {
              days: -4,
            },
          },
        })
      );
      expect(question.answers[1]).toEqual(
        expect.not.objectContaining({
          maximum: {
            value: "2018-02-17",
            offset_by: {
              years: 10,
            },
          },
        })
      );
      expect(question.period_limits).toEqual(
        expect.not.objectContaining({
          minimum: {
            days: 13,
          },
        })
      );
      expect(question.period_limits).toEqual(
        expect.not.objectContaining({
          maximum: {
            months: 2,
          },
        })
      );
    });

    it("should create date with qCodes", () => {
      const answers = [
        {
          type: DATE_RANGE,
          id: "1",
          properties: { required: true },
          validation,
          qCode: "123",
          secondaryQCode: "456",
          childAnswers: [
            { id: "1from", label: "Period from" },
            { id: "1to", label: "Period to" },
          ],
        },
      ];
      const question = new Question(createQuestionJSON({ answers }), ctx);

      expect(question.answers[0]).toEqual(
        expect.not.objectContaining({
          qCode: "123",
        })
      );
      expect(question.answers[1]).toEqual(
        expect.not.objectContaining({
          qCode: "456",
        })
      );
    });

    describe("Data version", () => {
      it("should add QCode when data version is not 3", () => {
        const answers = [
          {
            type: DATE_RANGE,
            id: "1",
            properties: { required: true },
            validation,
            label: "From",
            secondaryLabel: "To",
            qCode: "123",
            secondaryQCode: "456",
          },
        ];
        const question = new Question(createQuestionJSON({ answers }), ctx);

        expect(question.answers[0].q_code).toBe("123");
        expect(question.answers[1].q_code).toBe("456");
      });

      it("should not add QCode when data version is 3", () => {
        const answers = [
          {
            type: DATE_RANGE,
            id: "1",
            properties: { required: true },
            validation,
            label: "From",
            secondaryLabel: "To",
            qCode: "123",
            secondaryQCode: "456",
          },
        ];
        ctx.questionnaireJson.dataVersion = "3";
        const question = new Question(createQuestionJSON({ answers }), ctx);

        expect(question.answers[0].q_code).toBeUndefined();
        expect(question.answers[1].q_code).toBeUndefined();
      });
    });
  });

  describe("piping", () => {
    const createPipe = ({ id = 1, text = "foo", pipeType = "answers" } = {}) =>
      `<span data-piped="${pipeType}" data-id="${id}">${text}</span>`;

    const createContext = (
      metadata = [{ id: "123", type: "Text", key: "my_metadata" }]
    ) => ({
      questionnaireJson: {
        title: "Test Questionnaire",
        metadata,
        sections: [
          {
            folders: [
              {
                id: "folder-1",
                pages: [
                  { answers: [{ id: `1`, label: "A label?", type: "Text" }] },
                ],
              },
            ],
          },
        ],
      },
    });

    it("should handle piped values in title", () => {
      const question = new Question(
        createQuestionJSON({
          title: createPipe(),
        }),
        createContext()
      );
      expect(question.title).toEqual(
        createPipedFormat("a_label", "answer1", "answers")
      );
    });

    it("should handle piped values in guidance", () => {
      const question = new Question(
        createQuestionJSON({
          guidanceEnabled: true,
          guidance: `<p>${createPipe({
            id: 123,
            pipeType: "metadata",
          })}</p><p>hello</p>`,
        }),
        createContext()
      );
      expect(question.guidance.contents[0]).toEqual({
        description: createPipedFormat(
          "my_metadata",
          "my_metadata",
          "metadata"
        ),
      });
    });

    it("should ensure description text is not truncated if it includes multiple p tags", () => {
      const question = new Question(
        createQuestionJSON({
          description: `<p>foo</p><p>bar</p>`,
          descriptionEnabled: true,
        }),
        createContext()
      );

      expect(question.description).toEqual(["<p>foo</p><p>bar</p>"]);
    });

    it("should handle piped values in description", () => {
      const question = new Question(
        createQuestionJSON({
          description: `${createPipe()}`,
          descriptionEnabled: true,
        }),
        createContext()
      );
      expect(question.description).toEqual([
        createPipedFormat("a_label", "answer1", "answers"),
      ]);
    });
  });

  describe("mutually exclusive questions", () => {
    let answers;
    beforeEach(() => {
      answers = [
        {
          id: "1",
          type: "Number",
          label: "Number",
          properties: { required: false, decimals: 0 },
        },
        {
          id: "2",
          type: "MutuallyExclusive",
          properties: { required: false },
          options: [
            {
              id: "option-1",
              label: "Exclusive option 1",
            },
            {
              id: "option-2",
              label: "Exclusive option 2",
            },
            {
              id: "option-3",
              label: "Exclusive option 3",
            },
          ],
        },
      ];
    });

    it("should have a question type of mutually exclusive", () => {
      const question = new Question(createQuestionJSON({ answers }), ctx);
      expect(question).toMatchObject({
        type: "MutuallyExclusive",
      });
    });

    it("should have a question type of general when no mutually exclusive option", () => {
      const newAnswers = cloneDeep(answers);
      remove(newAnswers, { type: "MutuallyExclusive" });
      const question = new Question(
        createQuestionJSON({
          answers: newAnswers,
        }),
        ctx
      );
      expect(question).toMatchObject({
        type: "General",
      });
    });

    it("should return 2 answers when no other option", () => {
      const question = new Question(createQuestionJSON({ answers }), ctx);
      expect(question.answers).toHaveLength(2);
    });

    it("should have checkbox answer as last answer if there is only one mutually exclusive option", () => {
      // Sets mutually exclusive answer to only have one option
      answers[1].options = [
        {
          id: "option-1",
          label: "Exclusive option 1",
        },
      ];
      const question = new Question(createQuestionJSON({ answers }), ctx);
      question.answers[1].options = [
        {
          id: "option-1",
          label: "Exclusive option 1",
        },
      ];
      expect(last(question.answers)).toMatchObject({
        type: "Checkbox",
      });
    });

    it("should have radio answer as last answer if there is more than one mutually exclusive option", () => {
      const question = new Question(createQuestionJSON({ answers }), ctx);
      expect(last(question.answers)).toMatchObject({
        type: "Radio",
      });
    });

    it("should have unique answer id for the last answer", () => {
      const question = new Question(createQuestionJSON({ answers }), ctx);
      expect(last(question.answers)).toMatchObject({
        id: "answer2",
      });
    });

    it("should have a mandatory property", () => {
      const question = new Question(createQuestionJSON({ answers }), ctx);
      expect(question).toHaveProperty("mandatory");
    });

    it("should not inherit the label property", () => {
      const question = new Question(createQuestionJSON({ answers }), ctx);
      expect(question).not.toHaveProperty("label");
    });

    // TODO: This test can be edited after confirmation on mandatory and mutually exclusive requirements
    // it("should set mandatory on exclusive child answers to false", () => {
    //   const question = new Question(createQuestionJSON({ answers }), ctx);
    //   expect(question).toMatchObject({
    //     mandatory: true,
    //   });
    //   question.answers.map((answer) => {
    //     expect(answer).toMatchObject({
    //       mandatory: false,
    //     });
    //   });
    // });

    it("should have a checkbox answer as last answer when radio answer is used", () => {
      answers[1].options = [
        {
          id: "option-1",
          label: "Exclusive option 1",
        },
      ];
      // Changes the answer at position 0's type to Radio
      const convertedRadioAnswer = set("type", "Radio", answers[0]);
      convertedRadioAnswer.options = [
        {
          id: "1",
          label: "Option 1",
        },
        {
          id: "2",
          label: "Option 2",
        },
      ];

      const question = new Question(
        createQuestionJSON({
          answers: [convertedRadioAnswer, answers[1]],
        }),
        ctx
      );
      expect(question.answers).toEqual([
        expect.objectContaining({
          type: "Radio",
        }),
        expect.objectContaining({
          type: "Checkbox",
        }),
      ]);
    });

    it("should have a multiple options in the mutually exclusive answer", () => {
      const question = new Question(createQuestionJSON({ answers }), ctx);
      expect(last(question.answers).options).toEqual([
        {
          label: "Exclusive option 1",
          value: "Exclusive option 1",
        },
        {
          label: "Exclusive option 2",
          value: "Exclusive option 2",
        },
        {
          label: "Exclusive option 3",
          value: "Exclusive option 3",
        },
      ]);
    });
  });

  describe("Calculated Answer Validations", () => {
    let validation;
    beforeEach(() => {
      validation = {
        enabled: true,
        id: "foo",
        entityType: "Custom",
        condition: "Equal",
        custom: 5,
      };
    });

    it("should change the type to Calculated when there is a group validation", () => {
      const question = new Question(
        createQuestionJSON({
          totalValidation: validation,
        }),
        ctx
      );

      expect(question.type).toEqual("Calculated");
      expect(question.calculations).toHaveLength(1);
    });

    it("should do nothing when the validation is disabled", () => {
      validation.enabled = false;
      const question = new Question(
        createQuestionJSON({
          totalValidation: validation,
        }),
        ctx
      );

      expect(question.type).toEqual("General");
      expect(question.calculations).not.toBeDefined();
    });

    it("should change handle unanswered validaton and custom validation when allowUnanswered is false", () => {
      validation.allowUnanswered = true;

      const question = new Question(
        createQuestionJSON({
          totalValidation: validation,
        }),
        ctx
      );

      expect(question.calculations).toHaveLength(2);
    });

    it("should show all answers", () => {
      const question = new Question(
        createQuestionJSON({
          totalValidation: validation,
          answers: [
            { id: "1", type: NUMBER, properties: {} },
            { id: "2", type: NUMBER, properties: {} },
          ],
        }),
        ctx
      );

      expect(question.answers.map((a) => a.id)).toEqual(["answer1", "answer2"]);
    });

    it("should always output the calculation type as sum", () => {
      const question = new Question(
        createQuestionJSON({
          totalValidation: validation,
        }),
        ctx
      );
      expect(question.calculations[0].calculation_type).toEqual("sum");
    });

    it("should set the list of answers to calculate as all of the correct type on the page", () => {
      const question = new Question(
        createQuestionJSON({
          totalValidation: validation,
          answers: [
            { id: "1", type: NUMBER, properties: {} },
            { id: "2", type: NUMBER, properties: {} },
          ],
        }),
        ctx
      );

      expect(question.calculations[0].answers_to_calculate).toEqual([
        "answer1",
        "answer2",
      ]);
    });

    it("should map the condition the runner condition", () => {
      [
        { author: "GreaterThan", runner: ["greater than"] },
        { author: "GreaterOrEqual", runner: ["greater than", "equals"] },
        { author: "Equal", runner: ["equals"] },
        { author: "LessOrEqual", runner: ["less than", "equals"] },
        { author: "LessThan", runner: ["less than"] },
      ].forEach(({ author, runner }) => {
        validation.condition = author;
        const question = new Question(
          createQuestionJSON({
            totalValidation: validation,
          }),
          ctx
        );
        expect(question.calculations[0].conditions).toEqual(runner);
      });
    });

    it("should set the custom value when the entityType is Custom", () => {
      validation.entityType = "Custom";
      validation.custom = 10;
      validation.previousAnswer = { id: 20 };
      const question = new Question(
        createQuestionJSON({
          totalValidation: validation,
        }),
        ctx
      );
      expect(question.calculations[0].value).toEqual(10);
      expect(question.calculations[0].answer_id).not.toBeDefined();
    });

    it("should set the answer_id to the previous answer when entityType is PreviousAnswer", () => {
      validation.entityType = "PreviousAnswer";
      validation.custom = 10;
      validation.previousAnswer = "20";
      const question = new Question(
        createQuestionJSON({
          totalValidation: validation,
        }),
        ctx
      );
      expect(question.calculations[0].value.identifier).toEqual("answer20");
      expect(question.calculations[0].value.source).toEqual("answers");
    });

    describe("repeat label and input", () => {
      it("should create a dynamic answers array if this is enabled", () => {
        const question = new Question(
          createQuestionJSON({
            answers: [
              {
                properties: {
                  required: false,
                },
                repeatingLabelAndInput: true,
                repeatingLabelAndInputListId: "list-1",
              },
            ],
          }),
          ctx
        );

        expect(question.dynamic_answers).toBeDefined();
      });
      it("should set calculations field and question type if total validation is enabled", () => {
        const question = new Question(
          createQuestionJSON({
            totalValidation: validation,
            answers: [
              {
                properties: {
                  required: false,
                },
                repeatingLabelAndInput: true,
                repeatingLabelAndInputListId: "list-1",
              },
            ],
          }),
          ctx
        );

        expect(question.dynamic_answers).toBeDefined();
        expect(question.type).toEqual("Calculated");
        expect(question.calculations).toHaveLength(1);
      });
    });
  });
});
