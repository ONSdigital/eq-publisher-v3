const questionnaireFlow = require(".");

describe("questionnaire_flow", () => {
  let hub;
  let questionnaire = {
    hub: false,
  };

  it("should build linear questionnaire_flow with no options", () => {
    hub = new questionnaireFlow(questionnaire);
    expect(hub).toMatchObject({
      type: "Linear",
      options: {},
    });
  });

  it("should build linear questionnaire_flow with summary", () => {
    questionnaire.summary = true;
    hub = new questionnaireFlow(questionnaire);
    expect(hub).toMatchObject({
      type: "Linear",
      options: {
        summary: {},
      },
    });
  });

  it("should build hub questionnaire_flow with no mandatory sections", () => {
    questionnaire.hub = true;
    hub = new questionnaireFlow(questionnaire);
    expect(hub).toMatchObject({
      type: "Hub",
      options: {},
    });
  });

  it("should build hub questionnaire_flow with mandatory sections", () => {
    questionnaire.hub = true;
    questionnaire.sections = [
      {
        id: "one",
        requiredCompleted: true,
      },
      {
        id: "two",
        required: false,
      },
    ];
    hub = new questionnaireFlow(questionnaire);
    expect(hub).toMatchObject({
      type: "Hub",
      options: {
        required_completed_sections: ["one"],
      },
    });
  });
});
