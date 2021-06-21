class Questionnaire_Flow {
  constructor(questionnaireJson) {
    this.type = questionnaireJson.hub ? "Hub" : "Linear"
    this.options = this.build_options(questionnaireJson) 
  }

  build_options(questionnaireJson) {
    const options = {}
    if(questionnaireJson.hub) {
      if(questionnaireJson.required_completed_sections) {
          options.required_completed_sections = questionnaireJson.required_completed_sections
      }
      return options
    }
    if(questionnaireJson.summary) {
        options.summary = {
          collapsible: questionnaireJson.collapsibleSummary
      }
    }
    return options
  }
}

module.exports = Questionnaire_Flow;
