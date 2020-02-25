const Hub = require(".");

describe("Hub", () => {
  let hub;
  beforeEach(() => {
    hub = new Hub({
      required_completed_sections: ["sectionOne", "sectionTwo"]
    });
  });

  it("should build hub if selected", () => {
    expect(hub).toMatchObject({
      enabled: true,
      requiredCompletedSections: ["sectionOne", "sectionTwo"]
    });
  });
});
