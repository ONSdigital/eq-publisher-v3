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
  MUTUALLY_EXCLUSIVE,
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
                  pageType: "QuestionPage",
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

  describe("General answer types", () => {
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

    it("should add answer codes for currency answer", () => {
      const answer = {
        id: "currency-answer-1",
        type: CURRENCY,
        qCode: "currency-answer-code",
      };
      const questionnaire = createQuestionnaireJSON(answer);

      const answerCodes = createAnswerCodes(questionnaire);

      expect(answerCodes).toEqual([
        { answer_id: "answercurrency-answer-1", code: "currency-answer-code" },
      ]);
    });

    it("should add answer codes for unit answer", () => {
      const answer = {
        id: "unit-answer-1",
        type: UNIT,
        qCode: "unit-answer-code",
        properties: {
          unit: "Metres",
        },
      };
      const questionnaire = createQuestionnaireJSON(answer);

      const answerCodes = createAnswerCodes(questionnaire);

      expect(answerCodes).toEqual([
        { answer_id: "answerunit-answer-1", code: "unit-answer-code" },
      ]);
    });

    it("should add answer codes for percentage answer", () => {
      const answer = {
        id: "percentage-answer-1",
        type: PERCENTAGE,
        qCode: "percentage-answer-code",
      };
      const questionnaire = createQuestionnaireJSON(answer);

      const answerCodes = createAnswerCodes(questionnaire);

      expect(answerCodes).toEqual([
        {
          answer_id: "answerpercentage-answer-1",
          code: "percentage-answer-code",
        },
      ]);
    });

    it("should add answer codes for duration answer", () => {
      const answer = {
        id: "duration-answer-1",
        type: DURATION,
        qCode: "duration-answer-code",
        properties: {
          unit: "YearsMonths",
        },
      };
      const questionnaire = createQuestionnaireJSON(answer);

      const answerCodes = createAnswerCodes(questionnaire);

      expect(answerCodes).toEqual([
        {
          answer_id: "answerduration-answer-1",
          code: "duration-answer-code",
        },
      ]);
    });

    it("should add answer codes for date answer", () => {
      const answer = {
        id: "date-answer-1",
        type: DATE,
        qCode: "date-answer-code",
        properties: {
          format: "dd/mm/yyyy",
        },
      };
      const questionnaire = createQuestionnaireJSON(answer);

      const answerCodes = createAnswerCodes(questionnaire);

      expect(answerCodes).toEqual([
        {
          answer_id: "answerdate-answer-1",
          code: "date-answer-code",
        },
      ]);
    });

    it("should add answer codes for text area answer", () => {
      const answer = {
        id: "textarea-answer-1",
        type: TEXTAREA,
        qCode: "textarea-answer-code",
      };
      const questionnaire = createQuestionnaireJSON(answer);

      const answerCodes = createAnswerCodes(questionnaire);

      expect(answerCodes).toEqual([
        {
          answer_id: "answertextarea-answer-1",
          code: "textarea-answer-code",
        },
      ]);
    });

    it("should add answer codes for text field answer", () => {
      const answer = {
        id: "textfield-answer-1",
        type: TEXTFIELD,
        qCode: "textfield-answer-code",
      };
      const questionnaire = createQuestionnaireJSON(answer);

      const answerCodes = createAnswerCodes(questionnaire);

      expect(answerCodes).toEqual([
        {
          answer_id: "answertextfield-answer-1",
          code: "textfield-answer-code",
        },
      ]);
    });
  });

  describe("Date range", () => {
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
        {
          answer_id: "answerdate-range-answer-1from",
          code: "answer-from-code",
        },
        { answer_id: "answerdate-range-answer-1to", code: "answer-to-code" },
      ]);
    });
  });

  describe("Multiple choice answer types", () => {
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

    it("should add answer codes for checkbox answer and options", () => {
      const answer = {
        id: "checkbox-answer-1",
        type: CHECKBOX,
        qCode: "answer-checkbox-code",
        options: [
          {
            id: "checkbox-option-1",
            label: "Option 1",
          },
          {
            id: "checkbox-option-2",
            label: "Option 2",
          },
          {
            id: "checkbox-option-3",
            label: "Option 3",
            value: "Option 3 value",
          },
        ],
      };

      const questionnaire = createQuestionnaireJSON(answer);

      const answerCodes = createAnswerCodes(questionnaire);

      expect(answerCodes).toEqual([
        {
          answer_id: "answercheckbox-answer-1",
          code: "answer-checkbox-code",
        },
        {
          answer_id: "answercheckbox-answer-1",
          answer_value: "Option 1",
          code: "answer-checkbox-code",
        },
        {
          answer_id: "answercheckbox-answer-1",
          answer_value: "Option 2",
          code: "answer-checkbox-code",
        },
        {
          answer_id: "answercheckbox-answer-1",
          answer_value: "Option 3 value", // sets answer_value to option.value if option.value is not undefined or null
          code: "answer-checkbox-code",
        },
      ]);
    });

    it("should add answer codes for select answer and options", () => {
      const answer = {
        id: "select-answer-1",
        type: SELECT,
        qCode: "answer-select-code",
        options: [
          {
            id: "select-option-1",
            label: "Option 1",
          },
          {
            id: "select-option-2",
            label: "Option 2",
          },
        ],
      };

      const questionnaire = createQuestionnaireJSON(answer);

      const answerCodes = createAnswerCodes(questionnaire);

      expect(answerCodes).toEqual([
        {
          answer_id: "answerselect-answer-1",
          code: "answer-select-code",
        },
        {
          answer_id: "answerselect-answer-1",
          answer_value: "Option 1",
          code: "answer-select-code",
        },
        {
          answer_id: "answerselect-answer-1",
          answer_value: "Option 2",
          code: "answer-select-code",
        },
      ]);
    });

    it("should add answer codes for mutually exclusive answer and options", () => {
      const answer = {
        id: "exclusive-answer-1",
        type: MUTUALLY_EXCLUSIVE,
        qCode: "answer-exclusive-code",
        options: [
          {
            id: "exclusive-option-1",
            label: "Option 1",
          },
          {
            id: "exclusive-option-2",
            label: "Option 2",
          },
        ],
      };

      const questionnaire = createQuestionnaireJSON(answer);

      const answerCodes = createAnswerCodes(questionnaire);

      expect(answerCodes).toEqual([
        {
          answer_id: "answerexclusive-answer-1",
          code: "answer-exclusive-code",
        },
        {
          answer_id: "answerexclusive-answer-1",
          answer_value: "Option 1",
          code: "answer-exclusive-code",
        },
        {
          answer_id: "answerexclusive-answer-1",
          answer_value: "Option 2",
          code: "answer-exclusive-code",
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
});
