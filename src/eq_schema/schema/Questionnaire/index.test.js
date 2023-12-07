const { BUSINESS } = require("../../../constants/questionnaireTypes");

const Questionnaire = require(".");
const Section = require("../Section");

describe("Questionnaire", () => {
  const createQuestionnaireJSON = (questionnaire) =>
    Object.assign(
      {
        id: "1",
        title: "Quarterly Business Survey",
        description: "Quarterly Business Survey",
        type: BUSINESS,
        navigation: false,
        summary: true,
        hub: false,
        surveyId: "123",
        formType: "1234",
        eqId: "eq-id-1",
        theme: "business",
        legalBasis: "NOTICE_1",
        dataVersion: "1",
        sections: [
          {
            id: "1",
            title: "Section",
            folders: [
              {
                id: "folder-1",
                pages: [],
              },
            ],
          },
        ],
        metadata: [],
        supplementaryData: {
          surveyId: "123",
          data: [
            {
              listName: "",
            },
            {
              listName: "supplementary-list-1",
            },
            {
              listName: "supplementary-list-2",
            },
          ],
        },
        publishDetails: [{ surveyId: "874" }],
        collectionLists: {
          lists: [],
        },
        submission: {
          id: "123",
          furtherContent: "<p>Test</p>",
          viewPrintAnswers: true,
          feedback: true,
        },
      },
      questionnaire
    );

  let questionnaire;

  beforeEach(() => {
    questionnaire = new Questionnaire(createQuestionnaireJSON());
  });

  it("should build valid runner meta info", () => {
    expect(questionnaire).toMatchObject({
      mime_type: "application/json/ons/eq",
      schema_version: "0.0.1",
      data_version: "0.0.1",
      survey_id: "123",
      title: "Quarterly Business Survey",
      theme: "business",
      sections: [expect.any(Section)],
      supplementary_data: ["supplementary-list-1", "supplementary-list-2"],
      legal_basis:
        "Notice is given under section 1 of the Statistics of Trade Act 1947.",
    });
  });

  it("should include survey_id", () => {
    expect(questionnaire).toMatchObject({
      survey_id: "123",
    });
  });

  it("should set data_version to 0.0.1 when questionnaireJson dataVersion is not 3", () => {
    expect(questionnaire).toMatchObject({
      data_version: "0.0.1",
    });
  });

  it("should set data_version to 0.0.3 when questionnaireJson dataVersion is 3", () => {
    const questionnaire = new Questionnaire(
      createQuestionnaireJSON({ dataVersion: "3" })
    );
    expect(questionnaire).toMatchObject({
      data_version: "0.0.3",
    });
  });

  it("should include form_type", () => {
    expect(questionnaire).toMatchObject({
      form_type: "1234",
    });
  });

  it("should include the correct legal basis", () => {
    expect(questionnaire).toMatchObject({
      legal_basis:
        "Notice is given under section 1 of the Statistics of Trade Act 1947.",
    });
  });

  it("should delete the legal_basis key if the value is null", () => {
    const questionnaire = new Questionnaire(
      createQuestionnaireJSON({ legalBasis: "VOLUNTARY" })
    );

    expect(questionnaire.legal_basis).toBeUndefined();
  });

  it("should build navigation", () => {
    const questionnaire = new Questionnaire(
      createQuestionnaireJSON({
        navigation: true,
        sections: [
          {
            id: "2",
            title: "Section number 2",
            folders: [
              {
                id: "folder-2",
                pages: [],
              },
            ],
          },
          {
            id: "3",
            title: "Section number 3",
            folders: [
              {
                id: "folder-3",
                pages: [],
              },
            ],
          },
        ],
      })
    );

    expect(questionnaire).toMatchObject({
      navigation: {
        visible: true,
      },
      sections: [
        {
          id: "2",
        },
        {
          id: "3",
        },
      ],
    });
  });

  it("should strip out HTML from navigation sections", () => {
    const questionnaire = new Questionnaire(
      createQuestionnaireJSON({
        navigation: true,
        sections: [
          {
            id: "2",
            title: "<p>Section <em>number</em> 2</p>",
            folders: [
              {
                id: "folder-3",
                pages: [],
              },
            ],
          },
          {
            id: "3",
            title: "<p>Section <em>number</em> 3</p>",
            folders: [
              {
                id: "folder-4",
                pages: [],
              },
            ],
          },
        ],
      })
    );

    expect(questionnaire).toMatchObject({
      sections: [
        {
          id: "2",
          title: "Section number 2",
        },
        {
          id: "3",
          title: "Section number 3",
        },
      ],
    });
  });

  it("should add user defined metadata", () => {
    const questionnaireJson = createQuestionnaireJSON({
      metadata: [
        {
          key: "example_date",
          type: "Date",
        },
        {
          key: "example_text",
          type: "Text",
        },
        {
          key: "example_region",
          type: "Region",
        },
        {
          key: "example_language",
          type: "Language",
        },
      ],
    });

    expect(new Questionnaire(questionnaireJson)).toHaveProperty("metadata", [
      {
        name: "example_date",
        type: "date",
      },
      {
        name: "example_text",
        type: "string",
      },
      {
        name: "example_region",
        type: "string",
      },
      {
        name: "example_language",
        type: "string",
      },
    ]);
  });

  it("should set optional property for optional text", () => {
    const questionnaireJson = createQuestionnaireJSON({
      metadata: [
        {
          key: "example_date",
          type: "Date",
        },
        {
          key: "example_text",
          type: "Text_Optional",
        },
        {
          key: "example_region",
          type: "Region",
        },
        {
          key: "example_language",
          type: "Language",
        },
      ],
    });

    expect(new Questionnaire(questionnaireJson)).toHaveProperty("metadata", [
      {
        name: "example_date",
        type: "date",
      },
      {
        name: "example_text",
        type: "string",
        optional: true,
      },
      {
        name: "example_region",
        type: "string",
      },
      {
        name: "example_language",
        type: "string",
      },
    ]);
  });

  it("should allow setting northern ireland theme", () => {
    const questionnaireJson = createQuestionnaireJSON({
      theme: "northernireland",
    });

    expect(new Questionnaire(questionnaireJson)).toHaveProperty(
      "theme",
      "northernireland"
    );
  });

  it("should allow setting business theme", () => {
    const questionnaireJson = createQuestionnaireJSON({
      themeSettings: {
        previewTheme: "business",
        themes: [
          {
            shortName: "business",
          },
        ],
      },
    });

    expect(new Questionnaire(questionnaireJson)).toHaveProperty(
      "theme",
      "business"
    );
  });

  it("should set business theme if theme is invalid", () => {
    const questionnaireJson = createQuestionnaireJSON({
      themeSettings: {
        previewTheme: "invalidtheme",
        themes: [
          {
            shortName: "invalidtheme",
          },
        ],
      },
    });

    expect(new Questionnaire(questionnaireJson)).toHaveProperty(
      "theme",
      "business"
    );
  });

  it("should not add answer codes if data version is not 3", () => {
    const questionnaireJson = createQuestionnaireJSON();
    const questionnaire = new Questionnaire(questionnaireJson);

    expect(questionnaire.answer_codes).toBeUndefined();
  });

  it("should add answer codes if data version is 3", () => {
    const questionnaireJson = createQuestionnaireJSON({ dataVersion: "3" });
    const questionnaire = new Questionnaire(questionnaireJson);

    expect(questionnaire.answer_codes).not.toBeUndefined();
  });
});
