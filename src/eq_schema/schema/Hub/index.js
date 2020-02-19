class Hub {
  constructor(hub) {
    this.enabled = true;
    this.requiredCompletedSections = hub.required_completed_sections;
  }
}

module.exports = Hub;
