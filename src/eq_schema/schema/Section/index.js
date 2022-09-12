const Group = require("../Group");
const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { flow } = require("lodash/fp");
const { getText } = require("../../../utils/HTMLUtils");
const { buildIntroBlock } = require("../Block");
const { flatMap } = require("lodash");

const translateRoutingAndSkipRules = require("../../builders/routing2");
const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

const getListCollectorQuestion = (pages, item) => {
  const title = [];
  pages.find((page) => {
    if (page.listId === item.id) {
      title.push(page.addItemTitle);
    }
  });
  return title;
};
class Section {
  constructor(section, collectonLists, ctx) {
    this.id = `section${section.id}`;
    if (section.title) {
      this.title = getText(section.title);
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

    this.summary = {
      show_on_completion: section.sectionSummary || false,
      collapsible: false,
    };
    if (collectonLists) {
      const items = collectonLists.lists.map((item) => {
        return Section.buildItem(item, pages, ctx);
      });
      this.summary.items = items;
    }

    if ("showOnHub" in section) {
      this.show_on_hub = section.showOnHub;
    }

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
      const type = "display";

      this.enabled = translateRoutingAndSkipRules(
        section.displayConditions,
        "",
        "",
        type,
        ctx
      );
    }
  }

  static buildItem(item, pages, ctx) {
    const ListCollectorsSummmary = {
      type: "List",
      for_list: item.listName,
      title: {
        text: processPipe(ctx)(getListCollectorQuestion(pages, item)[0]),
        // to do : need to get the right list id for the list item
        //considaer if the id is the same fr 2 diff listcollector pages
      },
      add_link_text: "Add item to this list",
      empty_list_text: "There are no items",
    };
    return ListCollectorsSummmary;
  }
}

module.exports = Section;
