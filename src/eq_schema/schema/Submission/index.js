class Submission {
  constructor(postSubmission) {
    this.button = "Submit";
    if (postSubmission.viewPrintAnswers === true) {
      this.guidance =
        "You will have the opportunity to view, save or print a copy of your answers after submitting this survey.";
    }
    this.title = "Submit your questionnaire";
    this.warning = "You cannot view your answers after submission";
  }
}

module.exports = Submission;
