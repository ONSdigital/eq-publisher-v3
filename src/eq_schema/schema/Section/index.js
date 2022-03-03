const Group = require("../Group");
const { getText } = require("../../../utils/HTMLUtils");
const { buildIntroBlock } = require("../Block");
const { flatMap } = require("lodash");
const translateDisplayConditions = require("../../builders/expressionGroup");
class Section {
  constructor(section, ctx) {
    this.id = `section${section.id}`;
    if (section.title) {
      this.title = getText(section.title);
    }
    if ("showOnHub" in section) {
      this.show_on_hub = section.showOnHub;
    }
    const pages = flatMap(section.folders, (folder) =>
      flatMap(folder.pages, (page) =>
        folder.skipConditions
          ? {
              ...page,
              skipConditions: [
                ...folder.skipConditions,
                ...(page.skipConditions || []),
              ],
            }
          : page
      )
    );

    this.groups = [new Group({ ...section, pages }, ctx)];

    if (section.introductionTitle && section.introductionContent) {
      // Add introduction page if present
      this.groups[0].blocks.unshift(
        buildIntroBlock(
          section.introductionTitle,
          section.introductionContent,
          section.id,
          ctx
        )
      );
    }

    if (section.displayConditions) {
      this.enabled = translateDisplayConditions(section.displayConditions, ctx);
    }

    this.summary = {
      show_on_completion: section.sectionSummary || false,
      collapsible: section.collapsibleSummary || false,
    };
  }
}

module.exports = Section;
