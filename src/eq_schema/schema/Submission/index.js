const { flow } = require("lodash");

const {
  wrapContents,
  reversePipeContent,
} = require("../../../utils/compoundFunctions");

const reverseContent = (ctx) =>
  flow(wrapContents("content"), reversePipeContent(ctx));

class Submission {
  constructor(submission, ctx) {
    this.id = "post-submission-block";
    this.confirmation_email = submission.emailConfirmation;
    this.feedback = submission.feedback;
    this.view_response = submission.viewPrintAnswers;
    this.guidance = {
      id: "guidance",
      contents: [...this.buildContents(submission.furtherContent, ctx)],
    };
  }

  buildContents(description, ctx) {
    return reverseContent(ctx)(description).content;
  }
}

module.exports = Submission;
