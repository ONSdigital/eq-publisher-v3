const questionnaire_flow = require(".");

describe("questionnaire_flow", () => {
  let hub;
  let questionnaire = {
    hub: false
  };

  it("should build linear questionnaire_flow with no options", () => {
    hub = new questionnaire_flow(questionnaire);
    expect(hub).toMatchObject({
      type: "Linear",
      options:{}
    });
  });

  it("should build linear questionnaire_flow with summary", () => {
    questionnaire.summary = true
    hub = new questionnaire_flow(questionnaire);
    expect(hub).toMatchObject({
      type: "Linear",
      options: {
        summary:{}
      }
    });
  });

  it("should build linear questionnaire_flow with summary and collapsible", () => {
    questionnaire.collapsibleSummary = true
    hub = new questionnaire_flow(questionnaire);
    expect(hub).toMatchObject({
      type: "Linear",
      options: {
        summary:{
          collapsible:true
        }
      }
    });
  });

  it("should build hub questionnaire_flow with no mandatory sections", () => {
    questionnaire.hub = true
    hub = new questionnaire_flow(questionnaire);
    expect(hub).toMatchObject({
      type: "Hub",
      options: {}
    });
  });

  it("should build hub questionnaire_flow with mandatory sections", () => {
    questionnaire.hub = true
    questionnaire.sections = [{
      id: "section-one",
      required: true
    },{
      id: "section-two",
      required: false
    }]
    hub = new questionnaire_flow(questionnaire);
    expect(hub).toMatchObject({
      type: "Hub",
      options: {
        required_completed_sections: ["section-one"]
      }
    });
  });

});
