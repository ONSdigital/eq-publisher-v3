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
          folders: [
            {
              id: "0c113a37-41f8-4aed-889b-ccd4fec2f755",
              title: "",
              introductionTitle: null,
              introductionContent: null,
              pages: [
                {
                  id: "dda1a11f-5e9f-4c66-bb49-00e3d84553b0",
                  title: "<p>WE</p>",
                  pageType: "QuestionPage",
                  description: "",
                  descriptionEnabled: false,
                  guidance: null,
                  guidanceEnabled: false,
                  definitionLabel: null,
                  definitionContent: null,
                  definitionEnabled: false,
                  additionalInfoLabel: null,
                  additionalInfoContent: null,
                  additionalInfoEnabled: false,
                  confirmation: null,
                  answers: [
                    {
                      id: "6a6e7827-eea7-4c6a-9ab1-dc1de99cccf8",
                      type: "TextField",
                      label: "REW",
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
                  routing: null,
                  totalValidation: null,
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

  it("should pass data through", () => {
    expect(next).toHaveBeenCalledWith();
  });
});
