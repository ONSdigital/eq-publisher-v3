const { flow } = require("lodash");

const {
  wrapContents,
  reversePipeContent,
} = require("../../../utils/compoundFunctions");

const reverseContent = (ctx) =>
  flow(wrapContents("content"), reversePipeContent(ctx));

class PostSubmission {
  constructor(postSubmission, ctx) {
    this.feedback = postSubmission.feedback;
    this.view_response = postSubmission.viewPrintAnswers;
    this.guidance = {
      contents: [...this.buildContents(postSubmission.furtherContent, ctx)],
    };
  }

  buildContents(description, ctx) {
    return reverseContent(ctx)(description).content;
  }
}

module.exports = PostSubmission;
