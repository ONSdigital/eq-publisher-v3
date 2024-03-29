const Block = require("../Block");
const Section = require(".");

describe("Section", () => {
  const createSectionJSON = (options) =>
    Object.assign(
      {
        id: "1",
        title: "Section 1",
        folders: [
          {
            id: "folder-1",
            pages: [
              {
                id: "2",
                answers: [],
                pageDescription: "First page",
              },
            ],
          },
        ],
        sectionSummaryPageDescription: "Section 1 Page Title",
      },
      options
    );
  const createCtx = (options = {}) => ({
    routingGotos: [],
    questionnaireJson: { navigation: true },
    ...options,
  });

  it("should build valid runner Section from Author section", () => {
    const section = new Section(createSectionJSON(), createCtx());

    expect(section).toMatchObject({
      id: "1",
      title: "Section 1",
      groups: [
        {
          id: "group1",
          blocks: [expect.any(Block)],
        },
      ],
    });
  });

  it("should not output title when navigation is disabled", () => {
    const section = new Section(
      createSectionJSON(),
      createCtx({ questionnaireJson: { navigation: false } })
    );

    expect(section).toMatchObject({
      id: "1",
      groups: [
        {
          id: "group1",
          blocks: [expect.any(Block)],
        },
      ],
    });
  });

  it("should not add show_on_hub", () => {
    const sectionJSON = createSectionJSON();
    const section = new Section(sectionJSON, createCtx());
    expect("show_on_hub" in section).toBe(false);
  });

  it("should set show_on_hub to true", () => {
    const sectionJSON = createSectionJSON();
    sectionJSON.showOnHub = false;
    const section = new Section(sectionJSON, createCtx());
    expect(section.show_on_hub).toBe(false);
  });

  it("should set show_on_hub to false", () => {
    const sectionJSON = createSectionJSON();
    sectionJSON.showOnHub = true;
    const section = new Section(sectionJSON, createCtx());
    expect(section.show_on_hub).toBe(true);
  });

  describe("Section introduction", () => {
    it("should add introduction content to first group if present", () => {
      const sectionJSON = createSectionJSON();
      const title = "Beware the Jabberwock!";
      const description = "The jaws that bite! The claws that snatch!";
      const pageTitle = "Jabberwocky";
      sectionJSON.introductionTitle = title;
      sectionJSON.introductionContent = `<p>${description}</p>`;
      sectionJSON.introductionPageDescription = pageTitle;
      sectionJSON.introductionEnabled = true;

      const section = new Section(sectionJSON, createCtx());
      const introBlock = section.groups[0].blocks[0];

      expect(introBlock.type).toBe("Interstitial");
      expect(introBlock.content.title).toBe(title);
      expect(introBlock.content.contents[0].description).toBe(description);
      expect(introBlock.page_title).toBe(pageTitle);
    });

    it("shouldn't add introduction block when there's no title / content", () => {
      const sectionJSON = createSectionJSON();
      const section = new Section(sectionJSON, createCtx());
      expect(section.groups[0].blocks[0].type).not.toBe("Interstitial");
    });

    it("shouldn't add introduction block when section introduction page is not enabled", () => {
      const sectionJSON = createSectionJSON();
      const title = "Beware the Jabberwock!";
      const description = "The jaws that bite! The claws that snatch!";
      const pageTitle = "Jabberwocky";
      sectionJSON.introductionTitle = title;
      sectionJSON.introductionContent = `<p>${description}</p>`;
      sectionJSON.introductionPageDescription = pageTitle;
      sectionJSON.introductionEnabled = false;

      const section = new Section(sectionJSON, createCtx());
      const firstBlock = section.groups[0].blocks[0];

      expect(firstBlock.type).not.toBe("Interstitial");
      expect(firstBlock.page_title).not.toBe(pageTitle);
      expect(firstBlock.content).toBeUndefined();
    });
  });

  describe("Display conditions", () => {
    it("Should add a display condition if there are any", () => {
      const sectionJSON = createSectionJSON();

      sectionJSON.displayConditions = [
        {
          id: "2dd60b72-279a-47e9-b0db-e8ff1691adfe",
          operator: "And",
          expressions: [
            {
              id: "f9d2fb13-0120-4ae5-adf1-3561b30e030b",
              condition: "GreaterThan",
              left: {
                type: "Answer",
                answerId: "43881b52-bdb2-450e-ac05-0326c39cedcf",
              },
              right: {
                type: "Custom",
                customValue: {
                  number: 0,
                },
              },
            },
          ],
        },
      ];

      const section = new Section(sectionJSON, createCtx());

      expect(section.enabled).toBeTruthy();

      expect(section.enabled).toMatchObject({
        when: {
          ">": [
            {
              identifier: "answer43881b52-bdb2-450e-ac05-0326c39cedcf",
              source: "answers",
            },
            0,
          ],
        },
      });
    });

    it("Should not add display conditions if there are none", () => {
      const sectionJSON = createSectionJSON();

      const section = new Section(sectionJSON, createCtx());

      expect(section.enabled).toBeFalsy();
    });
  });

  describe("Section Folders", () => {
    it("should apply folder skip conditions to pages", () => {
      const sectionJSON = createSectionJSON();

      sectionJSON.folders[0].skipConditions = [
        {
          id: "skip-condition-1",
          operator: "And",
          expressions: [
            {
              id: "expression-1",
              condition: "Matches",
              left: {
                type: "Metadata",
                metadataId: "metadata-1",
              },
              right: {
                type: "Custom",
                customValue: {
                  text: "Test",
                },
              },
            },
          ],
        },
      ];

      const section = new Section(
        sectionJSON,
        createCtx({
          questionnaireJson: {
            metadata: [
              {
                id: "metadata-1",
                key: "test_metadata",
                alias: "Test metadata",
                type: "Text",
                textValue: "123",
              },
            ],
            sections: [sectionJSON],
          },
        })
      );

      expect(section.groups[0].blocks[0].skip_conditions).toMatchObject({
        when: {
          "==": [
            {
              source: "metadata",
              identifier: "test_metadata",
            },
            "Test",
          ],
        },
      });
    });

    it("should use listId to add for_list attribute to blocks", () => {
      const sectionJSON = createSectionJSON();

      sectionJSON.folders[0].listId = "list-1";
      sectionJSON.folders[0].pages[0].answers = [
        {
          id: "qualifier-answer",
          type: "Radio",
          options: [
            {
              id: "qualifier-positive-option",
              label: "Yes",
            },
            {
              id: "qualifier-negative-option",
              label: "No",
            },
          ],
        },
      ];
      sectionJSON.folders[0].pages[0].pageType = "ListCollectorQualifierPage";

      sectionJSON.folders[0].pages[1] = {
        id: "add-item-page",
        pageDescription: "Add item page description",
        pageType: "ListCollectorAddItemPage",
      };

      sectionJSON.folders[0].pages[2] = {
        id: "confirmation-page",
        answers: [
          {
            id: "confirmation-answer",
            options: [
              {
                id: "confirmation-positive-option",
                label: "Yes",
              },
              {
                id: "confirmation-negative-option",
                label: "No",
              },
            ],
          },
        ],
        pageDescription: "Confirmation page description",
        pageType: "ListCollectorConfirmationPage",
      };

      const section = new Section(
        sectionJSON,
        createCtx({
          questionnaireJson: {
            collectionLists: {
              lists: [
                {
                  id: "list-1",
                  listName: "first-list",
                  answers: [
                    {
                      id: "list-collector-answer-1",
                      type: "TextField",
                      properties: {
                        required: false,
                      },
                      label: "Text field",
                    },
                  ],
                },
              ],
            },
            sections: [sectionJSON],
          },
        })
      );

      expect(section.groups[0].blocks[0].for_list).toEqual("first-list");
      expect(section.groups[0].blocks[1].for_list).toEqual("first-list");
    });
  });

  describe("Section Summary", () => {
    const listCollectorSection = {
      id: "section-1",
      title: "Section 1",
      sectionSummaryPageDescription: "Section 1 Page Title",
      sectionSummary: true,
      folders: [
        {
          id: "folder-1",
          listId: "employees",
          pages: [
            {
              id: "qualifier-page",
              pageType: "ListCollectorQualifierPage",
              title: "Does your company employ anyone?",
              pageDescription: "Qualifier page title",
              position: 0,
              answers: [
                {
                  id: "qualifier-answer",
                  type: "Radio",
                  options: [
                    {
                      id: "qualifier-positive-option",
                      label: "Yes",
                    },
                    {
                      id: "qualifier-negative-option",
                      label: "No",
                    },
                  ],
                },
              ],
            },
            {
              id: "add-item-page",
              pageType: "ListCollectorAddItemPage",
              title: "What is the name of this person?",
              pageDescription: "Add item page title",
              position: 1,
            },
            {
              id: "confirmation-page",
              pageType: "ListCollectorConfirmationPage",
              title: "Does your company employ another person?",
              pageDescription: "Add another page title",
              answers: [
                {
                  id: "confirmation-answer",
                  type: "Radio",
                  options: [
                    {
                      id: "confirmation-positive-option",
                      label: "Yes",
                    },
                    {
                      id: "confirmation-negative-option",
                      label: "No",
                    },
                  ],
                },
              ],
              position: 2,
            },
          ],
        },
      ],
    };
    const createListCollectorCtx = () => ({
      routingGotos: [],
      questionnaireJson: {
        navigation: true,
        sections: [listCollectorSection],
        collectionLists: {
          id: "list1",
          lists: [
            {
              id: "employees",
              answers: [
                {
                  id: "cdea9794-6f3c-40c1-9de4-8bbe6e7c54b5",
                  type: "TextField",
                  repeatingLabelAndInput: false,
                  repeatingLabelAndInputListId: "",
                  properties: {
                    required: false,
                  },
                  validation: {},
                  label: "<p>Text 1</p>",
                },
                {
                  id: "57bdaf77-7f36-40f1-9994-e91862a95059",
                  type: "TextField",
                  repeatingLabelAndInput: false,
                  repeatingLabelAndInputListId: "",
                  properties: {
                    required: false,
                  },
                  validation: {},
                  label: "<p>Text 2</p>",
                },
                {
                  id: "43ee1461-e363-493f-90cc-d515a205efeb",
                  type: "TextField",
                  repeatingLabelAndInput: false,
                  repeatingLabelAndInputListId: "",
                  properties: {
                    required: false,
                  },
                  validation: {},
                  label: "<p>Text 3</p>",
                },
              ],
              listName: "test3",
            },
          ],
        },
      },
    });

    it("Should add summary if there is a list collector page", () => {
      const section = new Section(
        listCollectorSection,
        createListCollectorCtx()
      );
      expect(section).toMatchObject({
        id: "section-1",
        summary: {
          show_on_completion: true,
          page_title: "Section 1 Page Title",
          items: [
            {
              type: "List",
              for_list: "test3",
              title: "What is the name of this person?",
              item_anchor_answer_id: "answercdea9794-6f3c-40c1-9de4-8bbe6e7c54b5",
              item_label: "<p>Text 1</p>",
              add_link_text: "Add item to this list",
              empty_list_text: "There are no items",
            },
          ],
          show_non_item_answers: true,
        },
      });
    });
  });
});
