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
      sectionJSON.introductionTitle = title;
      sectionJSON.introductionContent = `<p>${description}</p>`;

      const section = new Section(sectionJSON, createCtx());
      const introBlock = section.groups[0].blocks[0];

      expect(introBlock.type).toBe("Interstitial");
      expect(introBlock.content.title).toBe(title);
      expect(introBlock.content.contents[0].description).toBe(description);
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
      expect(section.enabled[0]).toMatchObject({
        when: [
          {
            id: "answer43881b52-bdb2-450e-ac05-0326c39cedcf",
            condition: "greater than",
            value: 0,
          },
        ],
      });
    });

    it("Should not add display conditions if there are none", () => {
      const sectionJSON = createSectionJSON();

      const section = new Section(sectionJSON, createCtx());

      expect(section.enabled).toBeFalsy();
    });
  });
});
