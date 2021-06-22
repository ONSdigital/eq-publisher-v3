const { filter } = require("lodash");
class QuestionnaireFlow {
  constructor(questionnaireJson) {
    this.type = questionnaireJson.hub ? "Hub" : "Linear";
    this.options = this.buildOptions(questionnaireJson);
  }

  buildOptions(questionnaireJson) {
    const options = {}
    if(questionnaireJson.hub) {
      const requiredCompletedSections =
        this.buildRequiredSections(questionnaireJson);
      if (requiredCompletedSections.length) {
        options.requiredCompletedSections = requiredCompletedSections;
      }
      return options;
    };
    if(questionnaireJson.summary) {
        options.summary = {
          collapsible: questionnaireJson.collapsibleSummary
      };
    };
    return options;
  }

  buildRequiredSections(questionnaireJson){
    const sections = filter(questionnaireJson.sections, {"required": true});
    const requiredSections = sections.map((section) => section.id);
    return requiredSections;
  }
}

module.exports = QuestionnaireFlow;
