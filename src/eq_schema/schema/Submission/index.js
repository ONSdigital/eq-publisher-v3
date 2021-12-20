class Submission {
  constructor(submission) {
    this.id = "post-submission-block";
    this.confirmation_email = submission.emailConfirmation;
    this.feedback = submission.feedback;
    this.view_response = submission.viewPrintAnswers;
  }
}

module.exports = Submission;
