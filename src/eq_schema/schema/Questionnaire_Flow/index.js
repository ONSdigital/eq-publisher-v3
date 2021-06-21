class Questionnaire_Flow {
  constructor(questionnaire_flow) {
    this.enabled = true;
    this.requiredCompletedSections =
      questionnaire_flow.required_completed_sections;
  }
}

module.exports = Questionnaire_Flow;
