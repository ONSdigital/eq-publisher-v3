const Group = require("../Group");
const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { flow } = require("lodash/fp");
const { getText } = require("../../../utils/HTMLUtils");
const { getList } = require("../../../utils/functions/listGetters")
const { buildIntroBlock } = require("../Block");
const { flatMap, filter } = require("lodash");
const { TEXTFIELD, RADIO, CHECKBOX, SELECT } = require("../../../constants/answerTypes");

const translateRoutingAndSkipRules = require("../../builders/routing2");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

class Section {
  constructor(section, ctx) {
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

    if (section.repeatingSection) {
      const list = getList(ctx, section.repeatingSectionListId)
      this.repeat = {
        for_list: list.listName,
      };

      this.repeat.title = {
        text: `{repeat_title_placeholder}`,
        placeholders: [
          {
            placeholder: `repeat_title_placeholder`,
            transforms: [
              {
                arguments: {
                  delimiter: "&nbsp;",
                  list_to_concatenate: this.buildList(list.answers)
                },
                transform: "concatenate_list"
              }
            ]
          }
        ]
      }
    };

    this.summary = {
      show_on_completion: section.sectionSummary || false,
      page_title: section.pageDescription,
      collapsible: false,
    };

    const listCollectorPages = [];
    section.folders.forEach((folder) => {
      folder.pages.forEach((page) => {
        if (page.pageType === "ListCollectorPage") {
          listCollectorPages.push(page);
        }
      });
    });

    if (listCollectorPages.length > 0) {
      const items = listCollectorPages.map((listCollectorPage) => {
        return Section.buildItem(
          listCollectorPage.listId,
          listCollectorPage.addItemTitle,
          ctx
        );
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

  buildList(answers) {
    return filter(answers, (answer) => [TEXTFIELD, RADIO, CHECKBOX, SELECT].includes(answer.type)).map((answer) => ({
      source: "answers",
      identifier: `answer${answer.id}`
    }));
  };

  static buildItem(itemId, listCollectorTitle, ctx) {
    const ListCollectorsSummmary = {
      type: "List",
      for_list: getList(ctx, itemId).listName,
      title: processPipe(ctx)(listCollectorTitle),
      add_link_text: "Add item to this list",
      empty_list_text: "There are no items",
    };
    return ListCollectorsSummmary;
  }
}

module.exports = Section;
