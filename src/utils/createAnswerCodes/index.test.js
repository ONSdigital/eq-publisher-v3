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
      id: "1",
      title: "Test questionnaire",
      description: "Questionnaire for tests",
      theme: "default",
      navigation: false,
      summary: true,
      hub: false,
      surveyId: "123",
      dataVersion: 1,
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
          id: "1",
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
});
