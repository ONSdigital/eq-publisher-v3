const createAnswerCodes = require(".");

const {
  NUMBER,
  DATE,
  CHECKBOX,
  RADIO,
  TEXTFIELD,
  CURRENCY,
  PERCENTAGE,
  UNIT,
  DURATION,
  TEXTAREA,
  DATE_RANGE,
  SELECT,
  DROPDOWN,
} = require("../../constants/answerTypes");

describe("Create answer codes", () => {
  const createQuestionnaireJSON = (answer) =>
    Object.assign({
      id: "questionnaire-1",
      title: "Test questionnaire",
      description: "Questionnaire for tests",
      theme: "default",
      navigation: false,
      summary: true,
      hub: false,
      surveyId: "123",
      dataVersion: "3",
      themeSettings: {
        id: "1",
        previewTheme: "default",
        themes: [
          {
            enabled: true,
            shortName: "default",
            legalBasisCode: "NOTICE_1",
            eqId: "1",
            formType: "2",
            id: "default",
          },
        ],
      },
      sections: [
        {
          id: "section-1",
          title: "Section",
          folders: [
            {
              id: "folder-1",
              pages: [
                {
                  id: "page-1",
                  title: "Question 1",
                  answers: [
                    {
                      ...answer,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      metadata: [],
      publishDetails: [{ surveyId: "874" }],
      submission: {
        id: "123",
        furtherContent: "<p>Test</p>",
        viewPrintAnswers: true,
        emailConfirmation: true,
        feedback: true,
      },
    });

  it("should add answer codes for number answer", () => {
    const answer = {
      id: "number-answer-1",
      type: NUMBER,
      qCode: "number-answer-code",
    };
    const questionnaire = createQuestionnaireJSON(answer);

    const answerCodes = createAnswerCodes(questionnaire);

    // answernumber-answer-1 as `answer` is added to start for answer_id
    expect(answerCodes).toEqual([
      { answer_id: "answernumber-answer-1", code: "number-answer-code" },
    ]);
  });

  it("should add answer codes for date range answer", () => {
    const answer = {
      id: "date-range-answer-1",
      type: DATE_RANGE,
      label: "From",
      secondaryLabel: "To",
      qCode: "answer-from-code",
      secondaryQCode: "answer-to-code",
    };
    const questionnaire = createQuestionnaireJSON(answer);

    const answerCodes = createAnswerCodes(questionnaire);

    expect(answerCodes).toEqual([
      { answer_id: "answerdate-range-answer-1from", code: "answer-from-code" },
      { answer_id: "answerdate-range-answer-1to", code: "answer-to-code" },
    ]);
  });

  it("should add answer codes for radio answer and options", () => {
    const answer = {
      id: "radio-answer-1",
      type: RADIO,
      qCode: "answer-radio-code",
      options: [
        {
          id: "radio-option-1",
          label: "Option 1",
        },
        {
          id: "radio-option-2",
          label: "Option 2",
        },
        {
          id: "radio-option-3",
          label: "Option 3",
          value: "Option 3 value",
        },
      ],
    };

    const questionnaire = createQuestionnaireJSON(answer);

    const answerCodes = createAnswerCodes(questionnaire);

    expect(answerCodes).toEqual([
      {
        answer_id: "answerradio-answer-1",
        code: "answer-radio-code",
      },
      {
        answer_id: "answerradio-answer-1",
        answer_value: "Option 1",
        code: "answer-radio-code",
      },
      {
        answer_id: "answerradio-answer-1",
        answer_value: "Option 2",
        code: "answer-radio-code",
      },
      {
        answer_id: "answerradio-answer-1",
        answer_value: "Option 3 value", // sets answer_value to option.value if option.value is not undefined or null
        code: "answer-radio-code",
      },
    ]);
  });

  // Radio "Other" option in Author
  it("should add answer codes for additional radio option as an individual answer", () => {
    const answer = {
      id: "radio-answer-1",
      type: RADIO,
      qCode: "answer-radio-code",
      options: [
        {
          id: "radio-option-1",
          label: "Option 1",
        },
        {
          id: "radio-option-2",
          label: "Option 2",
        },
        {
          id: "radio-option-3",
          label: "Other answer",
          additionalAnswer: {
            id: "radio-additional-answer-1",
            type: TEXTFIELD,
            qCode: "additional-answer-code",
            label: "Additional answer",
          },
        },
      ],
    };

    const questionnaire = createQuestionnaireJSON(answer);

    const answerCodes = createAnswerCodes(questionnaire);

    expect(answerCodes).toEqual([
      {
        answer_id: "answerradio-answer-1",
        code: "answer-radio-code",
      },
      {
        answer_id: "answerradio-answer-1",
        answer_value: "Option 1",
        code: "answer-radio-code",
      },
      {
        answer_id: "answerradio-answer-1",
        answer_value: "Option 2",
        code: "answer-radio-code",
      },
      {
        answer_id: "answerradio-additional-answer-1",
        code: "additional-answer-code",
      },
    ]);
  });
});
