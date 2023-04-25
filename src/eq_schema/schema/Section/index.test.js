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
      id: "section1",
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
      id: "section1",
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

  describe("Section Summary ", () => {
    const listCollectorSection = {
      id: "1",
      title: "Section 1",
      sectionSummaryPageDescription: "Section 1 Page Title",
      folders: [
        {
          id: "folder-1",
          pages: [
            {
              id: "2",
              listId: "3",
              pageType: "ListCollectorPage",
              addItemTitle: "<p>What is the name of this person</p>",
            },
          ],
        },
      ],
      sectionSummary: true,
    };
    const createListCollectorCtx = () => ({
      routingGotos: [],
      questionnaireJson: {
        navigation: true,
        sections: [
          {
            id: "1",
            title: "Section 1",
            page_title: "Section 1 Page Title - Test Questionnaire",
            folders: [
              {
                id: "folder-1",
                pages: [
                  {
                    id: "2",
                    listId: "3",
                    pageType: "ListCollectorPage",
                    addItemTitle: "<p>What is the name of this person</p>",
                  },
                ],
              },
            ],
            sectionSummary: true,
          },
        ],
        collectionLists: {
          id: "list1",
          lists: [
            {
              id: "3",
              answers: [],
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
        id: "section1",
        summary: {
          show_on_completion: true,
          page_title: "Section 1 Page Title",
          items: [
            {
              type: "List",
              for_list: "test3",
              title: "What is the name of this person",
              add_link_text: "Add item to this list",
              empty_list_text: "There are no items",
            },
          ],
        },
      });
    });
  });
});
