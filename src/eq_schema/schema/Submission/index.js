const { flow } = require("lodash");

const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

class Submission {
  constructor(submission, ctx) {
    this.id = "post-submission-block";
    this.confirmation_email = submission.emailConfirmation;
    this.feedback = submission.feedback;
    this.view_response = submission.viewPrintAnswers;
    this.guidance = this.buildGuidance(submission.furtherContent, ctx);
  }

  buildGuidance(guidance, ctx) {
    return processPipe(ctx)(guidance);
  }
}

module.exports = Submission;
