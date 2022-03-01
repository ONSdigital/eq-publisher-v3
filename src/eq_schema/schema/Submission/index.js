const { flow } = require("lodash");

const {
  wrapContents,
  reversePipeContent
} = require("../../../utils/compoundFunctions");

const reverseContent = ctx =>
  flow(wrapContents("content"), reversePipeContent(ctx));

if (postSubmission.viewPrintAnswers === true) {
    class Submission {
        constructor(submission, ctx) {
          this.button = "Submit";
          this.guidance =
            "You will have the opportunity to view, save or print a copy of your answers after submitting this survey.";
          this.title = "Submit your questionnaire";
          this.warning = "You cannot view your answers after submission";
        }
        
}
if (postSubmission.viewPrintAnswers === false) {
    class Submission {
        constructor(submission, ctx) {
          this.button = "Submit";
          this.guidance =
            "You will have the opportunity to view, save or print a copy of your answers after submitting this survey.";
          this.title = "Submit your questionnaire";
          this.warning = "You cannot view your answers after submission";
        }
}

  buildContents(description, ctx) {
    return reverseContent(ctx)(description).content;
  }
}

module.exports = Submission;
