const Introduction = require(".");

const piping = '<span data-piped="metadata" data-id="1">[some_metadata]</span>';

describe("Introduction", () => {
  let apiData, context;
  const createPipedFormat = (placeholder, source) => ({
    text: `{${placeholder}}`,
    placeholders: [
      {
        placeholder,
        value: {
          identifier: placeholder,
          source,
        },
      },
    ],
  });
  beforeEach(() => {
    apiData = {
      id: "1",
      title:
        '<p>You are completing this for <span data-piped="metadata" data-id="ru_name">ru_name</span> (<span data-piped="metadata" data-id="trad_as">trad_as</span>)</p>',
      description: `<ul><li>Data should relate to all sites in England, Scotland, Wales and Northern Ireland unless otherwise stated. </li><li>You can provide info estimates if actual figures aren’t available.</li><li>We will treat your data securely and confidentially.</li><li>${piping}</li></ul>`,
      legalBasis: "NOTICE_2",
      secondaryTitle: `<p>Information you need ${piping}</p>`,
      secondaryDescription:
        "<p>You can select the dates of the period you are reporting for, if the given dates are not appropriate.</p>",
      collapsibles: [
        {
          id: "d45bf1dd-f286-40ca-b6a2-fe0014574c36",
          title: "<p>Hello</p>",
          description: `<p>World ${piping}</p>`,
        },
        {
          id: "1e7e5ecd-6f4c-4219-9893-6efdeea36ad0",
          title: "<p>Collapsible</p>",
          description: "<p>Description</p>",
        },
      ],
      tertiaryTitle: `<p>How we use your data ${piping}</p>`,
      tertiaryDescription: `<ul><li>You cannot appeal your selection. Your business was selected to give us a comprehensive view of the UK economy.</li><li>The information you provide contributes to Gross Domestic Product (GDP).</li><li>${piping}</li></ul>`,
      contactDetailsPhoneNumber: "0300 1234 931",
      contactDetailsEmailAddress: "surveys@ons.gov.uk",
      contactDetailsEmailSubject: "Change of details",
      contactDetailsIncludeRuRef: true,
    };
    context = {
      questionnaireJson: {
        metadata: [
          { id: "1", key: "some_metadata" },
          {
            id: "ru_name",
            key: "ru_name",
            alias: "Ru Name",
            type: "Text",
          },
          {
            id: "trad_as",
            key: "trad_as",
            alias: "Ru Name",
            type: "Text_Optional",
          },
        ],
      },
    };
  });

  it("set the correct id and type", () => {
    const introduction = new Introduction(apiData, context);
    expect(introduction.type).toEqual("Introduction");
    expect(introduction.id).toEqual("introduction");
  });

  it("should define the primary_content", () => {
    const introduction = new Introduction(apiData, context);
    expect(introduction.primary_content).toMatchObject([
      {
        id: "primary",
        title: {
          text: "You are completing this for {ru_name} {trad_as}",
          placeholders: [
            {
              placeholder: "ru_name",
              value: {
                source: "metadata",
                identifier: "ru_name",
              },
            },
            {
              placeholder: "trad_as",
              transforms: [
                {
                  arguments: {
                    trad_as: {
                      source: "metadata",
                      identifier: "trad_as",
                    },
                  },
                  transform: "conditional_trad_as",
                },
              ],
            },
          ],
        },
        contents: [
          {
            description: {
              text: "If the company details or structure have changed contact us on {telephone_number_link} or email {email_link}",
              placeholders: [
                {
                  placeholder: "telephone_number_link",
                  transforms: [
                    {
                      transform: "telephone_number_link",
                      arguments: {
                        telephone_number: "0300 1234 931",
                      },
                    },
                  ],
                },
                {
                  placeholder: "email_link",
                  transforms: [
                    {
                      transform: "email_link",
                      arguments: {
                        email_address: "surveys@ons.gov.uk",
                        email_subject: "Change of details",
                        email_subject_append: {
                          identifier: "ru_ref",
                          source: "metadata",
                        },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        contents: [
          {
            list: [
              "Data should relate to all sites in England, Scotland, Wales and Northern Ireland unless otherwise stated.",
              "You can provide info estimates if actual figures aren’t available.",
              "We will treat your data securely and confidentially.",
              createPipedFormat("some_metadata", "metadata"),
            ],
          },
        ],
        id: "description",
      },
    ]);
  });

  it("should define the preview_content from the secondary settings", () => {
    const introduction = new Introduction(apiData, context);
    expect(introduction.preview_content).toMatchObject({
      contents: [
        {
          description:
            "You can select the dates of the period you are reporting for, if the given dates are not appropriate.",
        },
      ],
      id: "preview",
      questions: expect.any(Array),
      title: {
        text: "Information you need {some_metadata}",
        placeholders: [
          {
            placeholder: "some_metadata",
            value: {
              identifier: "some_metadata",
              source: "metadata",
            },
          },
        ],
      },
    });
  });

  it("should define the preview_content questions from collapsibles", () => {
    const introduction = new Introduction(apiData, context);
    expect(introduction.preview_content.questions).toMatchObject([
      {
        contents: [
          {
            description: {
              text: "World {some_metadata}",
              placeholders: [
                {
                  placeholder: "some_metadata",
                  value: {
                    identifier: "some_metadata",
                    source: "metadata",
                  },
                },
              ],
            },
          },
        ],
        question: "Hello",
      },
      {
        contents: [{ description: "Description" }],
        question: "Collapsible",
      },
    ]);
  });

  it("should not publish partially completed collapsibles", () => {
    apiData.collapsibles = [
      {
        id: "d45bf1dd-f286-40ca-b6a2-fe0014574c36",
        title: "<p>Hello</p>",
        description: "<p>World</p>",
      },
      {
        id: "d45bf1dd-f286-40ca-b6a2-fe0014574c36",
        title: "<p>Hello</p>",
        description: "",
      },
      {
        id: "d45bf1dd-f286-40ca-b6a2-fe0014574c36",
        title: "",
        description: "<p>Description</p>",
      },
    ];
    const introduction = new Introduction(apiData, context);
    expect(introduction.preview_content.questions).toMatchObject([
      {
        contents: [{ description: "World" }],
        question: "Hello",
      },
    ]);
  });

  it("should define the secondary_content from the tertiary settings", () => {
    const introduction = new Introduction(apiData, context);
    expect(introduction.secondary_content).toEqual([
      {
        id: "secondary-content",
        contents: [
          {
            title: {
              text: "How we use your data {some_metadata}",
              placeholders: [
                {
                  placeholder: "some_metadata",
                  value: {
                    identifier: "some_metadata",
                    source: "metadata",
                  },
                },
              ],
            },
          },
          {
            list: [
              "You cannot appeal your selection. Your business was selected to give us a comprehensive view of the UK economy.",
              "The information you provide contributes to Gross Domestic Product (GDP).",
              createPipedFormat("some_metadata", "metadata"),
            ],
          },
        ],
      },
    ]);
  });
});
