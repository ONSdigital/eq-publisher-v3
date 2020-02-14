class Hub {
  constructor(hub, ctx) {
    this.enabled = true;
    this.required_completed_sections = hub.requiredCompletedSections;
  }
}

module.exports = Hub;
