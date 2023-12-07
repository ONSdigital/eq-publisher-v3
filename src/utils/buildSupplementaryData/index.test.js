const buildSupplementaryData = require(".");

describe("buildSupplementaryData", () => {
  const createQuestionnaireJson = () =>
    Object.assign({
      id: "questionnaire-1",
      title: "Test questionnaire",
      description: "Testing questionnaire",
      theme: "default",
      supplementaryData: {
        surveyId: "123",
        data: [
          {
            id: "supplementary-data-1",
            listName: "supplementary-list-1",
          },
          {
            id: "supplementary-data-2",
            listName: "supplementary-list-2",
          },
        ],
      },
    });

  it("should add supplementary data list names", () => {
    const questionnaire = createQuestionnaireJson();
    const supplementaryData = buildSupplementaryData(
      questionnaire.supplementaryData
    );

    expect(supplementaryData).toEqual([
      "supplementary-list-1",
      "supplementary-list-2",
    ]);
  });

  it("should not add supplementary data list names for empty strings", () => {
    const questionnaire = createQuestionnaireJson();
    questionnaire.supplementaryData.data.push({
      id: "empty-list-name",
      listName: "",
    });

    expect(questionnaire.supplementaryData.data).toEqual([
      {
        id: "supplementary-data-1",
        listName: "supplementary-list-1",
      },
      {
        id: "supplementary-data-2",
        listName: "supplementary-list-2",
      },
      {
        id: "empty-list-name",
        listName: "",
      },
    ]);

    const supplementaryData = buildSupplementaryData(
      questionnaire.supplementaryData
    );

    expect(supplementaryData).toEqual([
      "supplementary-list-1",
      "supplementary-list-2",
    ]);
  });

  it("should not add duplicated supplementary data list names", () => {
    const questionnaire = createQuestionnaireJson();
    questionnaire.supplementaryData.data.push({
      id: "duplicted-list-name",
      listName: "supplementary-list-1",
    });

    expect(questionnaire.supplementaryData.data).toEqual([
      {
        id: "supplementary-data-1",
        listName: "supplementary-list-1",
      },
      {
        id: "supplementary-data-2",
        listName: "supplementary-list-2",
      },
      {
        id: "duplicted-list-name",
        listName: "supplementary-list-1",
      },
    ]);

    const supplementaryData = buildSupplementaryData(
      questionnaire.supplementaryData
    );

    expect(supplementaryData).toEqual([
      "supplementary-list-1",
      "supplementary-list-2",
    ]);
  });
});
