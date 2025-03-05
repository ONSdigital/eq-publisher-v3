const Group = require("../Group");
const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { flow } = require("lodash/fp");
const { getText } = require("../../../utils/HTMLUtils");
const {
  getList,
  getSupplementaryList,
} = require("../../../utils/functions/listGetters");
const { buildIntroBlock } = require("../Block");
const { flatMap, filter } = require("lodash");
const {
  TEXTFIELD,
  RADIO,
  CHECKBOX,
  SELECT,
} = require("../../../constants/answerTypes");

const translateRoutingAndSkipRules = require("../../builders/routing2");

const processPipe = (ctx, isMultipleChoiceValue = false, isRepeatingSection) =>
  flow(
    convertPipes(ctx, isMultipleChoiceValue, isRepeatingSection),
    getInnerHTMLWithPiping
  );

class Section {
  constructor(section, ctx) {
    this.id = section.id;
    if (section.title) {
      this.title = processPipe(ctx)(getText(section.title));
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
              listId: folder.listId,
            }
          : { ...page, listId: folder.listId }
      )
    );

    if (section.repeatingSection) {
      let placeholder;
      let list = getList(ctx, section.repeatingSectionListId);

      if (list) {
        placeholder = {
          placeholder: `repeat_title_placeholder`,
          transforms: [
            {
              arguments: {
                delimiter: " ",
                list_to_concatenate: this.buildList(list.answers),
              },
              transform: "concatenate_list",
            },
          ],
        };
      } else {
        list = getSupplementaryList(ctx, section.repeatingSectionListId);
        placeholder = {
          placeholder: `repeat_title_placeholder`,
          value: {
            source: "supplementary_data",
            identifier: list.schemaFields[0].identifier,
            selectors: [list.schemaFields[0].selector],
          },
        };
      }

      this.repeat = {
        for_list: list.listName,
      };

      this.repeat.title = this.containsPiping(section.title)
        ? processPipe(ctx, false, section.repeatingSection)(section.title)
        : {
            text: `{repeat_title_placeholder}`,
            placeholders: [placeholder],
          };
    }

    this.summary = {
      show_on_completion: section.sectionSummary || false,
      page_title: processPipe(ctx)(section.sectionSummaryPageDescription),

      collapsible: false,
    };

    const listCollectorFolders = [];
    section.folders.forEach((folder) => {
      if (folder.listId) {
        listCollectorFolders.push(folder);
      }
    });

    if (listCollectorFolders.length > 0) {
      const items = listCollectorFolders.map((listCollectorFolder) => {
        return Section.buildItem(
          listCollectorFolder.listId,
          listCollectorFolder.pages[1].title,
          ctx
        );
      });

      this.summary.items = items;
      this.summary.show_non_item_answers = true;
    }

    if ("showOnHub" in section) {
      this.show_on_hub = section.showOnHub;
    }

    this.groups = [new Group({ ...section, pages }, ctx)];

    if (
      section.introductionEnabled &&
      section.introductionTitle &&
      section.introductionContent &&
      section.introductionPageDescription
    ) {
      // Add introduction page if present
      this.groups[0].blocks.unshift(
        buildIntroBlock(
          section.introductionTitle,
          section.introductionContent,
          section.introductionPageDescription,
          section.repeatingSection,
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
    return filter(answers, (answer) =>
      [TEXTFIELD, RADIO, CHECKBOX, SELECT].includes(answer.type)
    ).map((answer) => ({
      source: "answers",
      identifier: `answer${answer.id}`,
    }));
  }

  containsPiping(text) {
    const regex = /<span[^>]*>([^<]+)<\/span>/;
    return regex.test(text);
  }

  static buildItem(itemId, listCollectorTitle, ctx) {
    const list = getList(ctx, itemId);
    let anchorItem = list.answers[0];

    const ListCollectorsSummary = {
      type: "List",
      for_list: list.listName,
      title: processPipe(ctx)(listCollectorTitle),
      item_anchor_answer_id: `answer${anchorItem.id}`,
      item_label: anchorItem.label,
      add_link_text: "Add item to this list",
      empty_list_text: "There are no items",
    };
    return ListCollectorsSummary;
  }
}

module.exports = Section;
