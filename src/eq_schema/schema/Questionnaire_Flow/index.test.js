const questionnaire_flow = require(".");

describe("questionnaire_flow", () => {
  let hub;
  beforeEach(() => {
    hub = new questionnaire_flow({
      required_completed_sections: ["sectionOne", "sectionTwo"],
    });
  });

  it("should build questionnaire_flow if selected", () => {
    expect(questionnaire_flow).toMatchObject({
      enabled: true,
      requiredCompletedSections: ["sectionOne", "sectionTwo"],
    });
  });
});
