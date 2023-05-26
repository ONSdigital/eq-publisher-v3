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
        title:
          '<p>You are completing this for <span data-piped="metadata" data-id="edbdee9e-250b-4b6d-8e62-296b7bcf60cf">trad_as</span> (<span data-piped="metadata" data-id="27a09e91-f43e-49ed-8a42-b74d35de72de">ru_name</span>)</p>',
        description:
          "<ul><li>Data should relate to all sites in England, Scotland, Wales and Northern Ireland unless otherwise stated. </li><li>You can provide info estimates if actual figures aren’t available.</li><li>We will treat your data securely and confidentially.</li></ul>",
        legalBasis: "NOTICE_1",
        secondaryTitle: "<p>Information you need</p>",
        secondaryDescription:
          "<p>You can select the dates of the period you are reporting for, if the given dates are not appropriate.</p>",
        collapsibles: [],
        tertiaryTitle: "<p>How we use your data</p>",
        tertiaryDescription:
          "<ul><li>You cannot appeal your selection. Your business was selected to give us a comprehensive view of the UK economy.</li><li>The information you provide contributes to Gross Domestic Product (GDP).</li></ul>",
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
        {
          id: "edbdee9e-250b-4b6d-8e62-296b7bcf60cf",
          key: "trad_as",
          type: "Text",
        },
        {
          id: "13b67b7d-b2cb-48a7-b609-16df3b7b0cbd",
          key: "period_id",
          type: "Text",
        },
        {
          id: "63971dbd-7928-4973-86f8-61b4d698ed5b",
          key: "ref_p_start_date",
          type: "Date",
        },
        {
          id: "4da1c35b-1a1a-46ef-bec9-6fc07b49cf63",
          key: "ref_p_end_date",
          type: "Date",
        },
        {
          id: "d2b7b368-657f-4e86-8c19-9c6caa2ea9e9",
          key: "employment_date",
          type: "Date",
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
});
