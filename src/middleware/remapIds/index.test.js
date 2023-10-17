const remapIds = require(".");
const Questionnaire = require("../../eq_schema");
jest.mock("../../eq_schema");

describe("Remap Ids", () => {
  let req, res, next, questionnaire;
  let middleware; // eslint-disable-line no-unused-vars
  beforeEach(() => {
    Questionnaire.mockClear();

    questionnaire = {
      id: "ce53bd70-f78b-4ea5-8f06-289da70f980b",
      title: "TEST",
      description: null,
      type: "Business",
      theme: "business",
      introduction: {
        id: "bee2bd7b-36ce-4690-8a65-cfefadfdd4be",
        title: "test",
        description: "test",
        legalBasis: "NOTICE_1",
        secondaryTitle: "test",
        secondaryDescription: "test",
        collapsibles: [],
        tertiaryTitle: "test",
        tertiaryDescription: "test",
      },
      navigation: false,
      surveyId: null,
      summary: false,
      metadata: [
        {
          id: "27a09e91-f43e-49ed-8a42-b74d35de72de",
          key: "ru_name",
          type: "Text",
        },
      ],
      sections: [
        {
          title: "Section1",
          sectionSummary: true,
          sectionSummaryPageDescription: "Summary page",
          folders: [
            {
              id: "0c113a37-41f8-4aed-889b-ccd4fec2f755",
              title: "",
              introductionTitle: null,
              introductionContent: null,
              pages: [
                {
                  id: "page-1",
                  title: "<p>Q1</p>",
                  pageType: "QuestionPage",
                  pageDescription: "Question page 1",
                  descriptionEnabled: false,
                  guidance: null,
                  guidanceEnabled: false,
                  definitionLabel: null,
                  definitionContent: null,
                  definitionEnabled: false,
                  additionalInfoLabel: null,
                  additionalInfoContent: null,
                  additionalInfoEnabled: false,
                  answers: [
                    {
                      id: "6a6e7827-eea7-4c6a-9ab1-dc1de99cccf8",
                      type: "TextField",
                      label: "Label1",
                      secondaryLabel: null,
                      description: "",
                      guidance: "",
                      properties: {
                        required: false,
                      },
                      qCode: "",
                      secondaryQCode: null,
                      validation: null,
                    },
                  ],
                  totalValidation: null,
                  confirmation: {
                    id: "confirmation-1",
                    title: "<p>Confirmation1</p>",
                    pageDescription: "Confirmation page",
                    positive: {
                      id: "positive",
                      label: "Yes",
                      description: "",
                    },
                    negative: {
                      id: "negative",
                      label: "No",
                      description: "",
                    },
                  },
                  routing: {
                    id: "c3ee83a4-fb7c-42f8-ac3f-cf0b0116c648",
                    else: {
                      id: "page-2",
                      pageId: "page-2",
                    },
                    rules: [
                      {
                        id: "f45b9ddd-80a4-4be6-8774-a2d3ec84028e",
                        destination: {
                          id: "page-3",
                          pageId: "page-3",
                        },
                        expressionGroup: {
                          id: "5a0d0b9e-891a-44b2-8d77-d4d771174c64",
                          operator: null,
                          expressions: [
                            {
                              id: "2b8366e3-2d48-4f8b-85cd-32678a5b7cdf",
                              condition: "Equal",
                              left: {
                                type: "Answer",
                                answerId:
                                  "34974003-c483-441b-9ec4-18c978a322f0",
                                metadataId: "",
                              },
                              right: {
                                type: "Custom",
                                customValue: {
                                  number: 10,
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  id: "page-2",
                  title: "<p>Q2</p>",
                  pageType: "QuestionPage",
                  pageDescription: "Question page 2",
                  descriptionEnabled: false,
                  guidance: null,
                  guidanceEnabled: false,
                  definitionLabel: null,
                  definitionContent: null,
                  definitionEnabled: false,
                  additionalInfoLabel: null,
                  additionalInfoContent: null,
                  additionalInfoEnabled: false,
                  answers: [
                    {
                      id: "6a6e7827-eea7-4c6a-9ab1-dc1de99cccf8",
                      type: "TextField",
                      label: "Label2",
                      secondaryLabel: null,
                      description: "",
                      guidance: "",
                      properties: {
                        required: false,
                      },
                      qCode: "",
                      secondaryQCode: null,
                      validation: null,
                    },
                  ],
                },
                {
                  id: "page-3",
                  title: "<p>Q3</p>",
                  pageType: "QuestionPage",
                  pageDescription: "Question page 3",
                  descriptionEnabled: false,
                  guidance: null,
                  guidanceEnabled: false,
                  definitionLabel: null,
                  definitionContent: null,
                  definitionEnabled: false,
                  additionalInfoLabel: null,
                  additionalInfoContent: null,
                  additionalInfoEnabled: false,
                  answers: [
                    {
                      id: "6a6e7827-eea7-4c6a-9ab1-dc1de99cccf8",
                      type: "TextField",
                      label: "Label3",
                      secondaryLabel: null,
                      description: "",
                      guidance: "",
                      properties: {
                        required: false,
                      },
                      qCode: "",
                      secondaryQCode: null,
                      validation: null,
                    },
                  ],
                },
                {
                  id: "page-4",
                  pageType: "ListCollectorPage",
                  title: "Collect1",
                  listId: "list1",
                  drivingQuestion: "<p>Q1</p>",
                  pageDescription: "List1 driving",
                  additionalGuidancePanel: "",
                  additionalGuidancePanelSwitch: false,
                  drivingPositive: "Yes",
                  drivingNegative: "No",
                  drivingPositiveDescription: "",
                  drivingNegativeDescription: "",
                  anotherTitle: "<p>List1 repeat</p>",
                  anotherPageDescription: "List1 repeat",
                  anotherPositive: "Yes",
                  anotherNegative: "No",
                  anotherPositiveDescription: "",
                  anotherNegativeDescription: "",
                  addItemTitle: "<p>List1 collect</p>",
                  addItemPageDescription: "List1 collect",
                  routing: null,
                  alias: "",
                  drivingQCode: "q2",
                  anotherQCode: "q3",
                },
                {
                  id: "page-5",
                  title: "<p>calcsum</p>",
                  pageType: "CalculatedSummaryPage",
                  pageDescription: "Calculated Summary",
                  type: "Number",
                  totalTitle: "totalCalcSum",
                  answers: [
                    {
                      id: "a18",
                      type: "Number",
                      label: "totalCalcSum",
                      secondaryLabel: null,
                      description: "",
                      guidance: "",
                      properties: {
                        required: false,
                      },
                      qCode: "",
                      secondaryQCode: null,
                      validation: null,
                    },
                  ],
                  summaryAnswers: [],
                },

                {
                  id: "page-6",
                  title:
                    '<p>calc<span data-piped="variable" data-id="page-5">[totalCalcSum]</span></p>',
                  pageType: "QuestionPage",
                  pageDescription: "Question page 6",
                  descriptionEnabled: false,
                  guidance: null,
                  guidanceEnabled: false,
                  definitionLabel: null,
                  definitionContent: null,
                  definitionEnabled: false,
                  additionalInfoLabel: null,
                  additionalInfoContent: null,
                  additionalInfoEnabled: false,
                  answers: [
                    {
                      id: "a6",
                      type: "TextField",
                      label: "Label6",
                      secondaryLabel: null,
                      description: "",
                      guidance: "",
                      properties: {
                        required: false,
                      },
                      qCode: "",
                      secondaryQCode: null,
                      validation: null,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    req = jest.fn();
    res = {
      locals: { questionnaire },
    };
    next = jest.fn();

    remapIds(req, res, next);
  });

  it("should move to next if successful", () => {
    req.body = questionnaire;

    middleware = remapIds(req, res, next);

    expect(res.locals.questionnaire).toEqual(questionnaire);
    expect(next).toHaveBeenCalled();
  });

  it("should remap section page id", () => {
    req.body = questionnaire;

    middleware = remapIds(req, res, next);

    expect(res.locals.questionnaire).toEqual(questionnaire);
    expect(res.locals.questionnaire.sections[0].id).toEqual("summary-page");
  });

  it("should remap question page id", () => {
    req.body = questionnaire;

    middleware = remapIds(req, res, next);

    expect(res.locals.questionnaire).toEqual(questionnaire);
    expect(res.locals.questionnaire.sections[0].folders[0].pages[0].id).toEqual(
      "question-page-1"
    );
  });

  it("should remap confirmation question page id", () => {
    req.body = questionnaire;

    middleware = remapIds(req, res, next);

    expect(res.locals.questionnaire).toEqual(questionnaire);
    expect(
      res.locals.questionnaire.sections[0].folders[0].pages[0].confirmation.id
    ).toEqual("confirmation-page");
  });

  it("should remap destination page id", () => {
    req.body = questionnaire;

    middleware = remapIds(req, res, next);

    expect(res.locals.questionnaire).toEqual(questionnaire);
    expect(
      res.locals.questionnaire.sections[0].folders[0].pages[0].routing.rules[0]
        .destination.pageId
    ).toEqual("question-page-3");
  });

  it("should remap routing else page id", () => {
    req.body = questionnaire;

    middleware = remapIds(req, res, next);

    expect(res.locals.questionnaire).toEqual(questionnaire);
    expect(
      res.locals.questionnaire.sections[0].folders[0].pages[0].routing.else
        .pageId
    ).toEqual("question-page-2");
  });

  it("should remap list collector question page id", () => {
    req.body = questionnaire;

    middleware = remapIds(req, res, next);

    expect(res.locals.questionnaire).toEqual(questionnaire);
    expect(res.locals.questionnaire.sections[0].folders[0].pages[3].id).toEqual(
      "list1-repeat"
    );
  });

  it("should remap the data id in the calculated summary variable piped into a page title ", () => {
    req.body = questionnaire;

    middleware = remapIds(req, res, next);

    expect(res.locals.questionnaire).toEqual(questionnaire);
    expect(
      res.locals.questionnaire.sections[0].folders[0].pages[5].title
    ).toEqual(
      '<p>calc<span data-piped="variable" data-id="calculated-summary">[totalCalcSum]</span></p>'
    );
  });
});
