class Submission {
  constructor(postSubmission) {
    this.button = "Submit";
    this.title = "Submit your questionnaire";
    this.warning = "You cannot view your answers after submission";
    if (postSubmission.viewPrintAnswers) {
      this.guidance =
        "You will have the opportunity to view, save or print a copy of your answers after submitting this survey.";
      this.title = "Check your answers and submit";
      this.warning = "You must submit this survey to complete it";
    }
  }
}

module.exports = Submission;
