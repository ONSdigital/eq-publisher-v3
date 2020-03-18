const { getText } = require("../../../utils/HTMLUtils");
const newPipes = require("../../../utils/convertPipes").newPipes;

const Group = require("../Group");

// const processNewPipe = ctx => newPipes(ctx);

class Section {
  constructor(section, ctx) {
    this.id = `section${section.id}`;
    if (ctx.questionnaireJson.navigation) {
      this.title = getText(section.title);
    }
    // this.introductionTitle = processNewPipe(ctx)(section.introductionTitle);
    // this.introductionContent = processNewPipe(ctx)(section.introductionContent);

    this.groups = this.buildGroups(section, ctx);
  }

  buildGroups(section, ctx) {
    // Sections always contain a single group currently
    return [new Group(getText(section.title), section, ctx)];
  }
}

module.exports = Section;
