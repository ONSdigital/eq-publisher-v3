const { getText } = require("../../../utils/HTMLUtils");
const { flatMap } = require("lodash");

const Group = require("../Group");

class Section {
  constructor(section, ctx) {
    this.id = `section${section.id}`;
    if (ctx.questionnaireJson.navigation) {
      this.title = getText(section.title);
    }

    const pages = flatMap(section.folders, (folder) =>
      flatMap(folder.pages, (page) =>
        folder.skipConditions
          ? { ...page, skipConditions: folder.skipConditions }
          : page
      )
    );

    this.groups = [new Group(this.title || "", { ...section, pages }, ctx)];
  }
}

module.exports = Section;
