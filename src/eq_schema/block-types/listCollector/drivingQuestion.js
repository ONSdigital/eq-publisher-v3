const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { flow } = require("lodash/fp");
const { flatMap, find, findIndex } = require("lodash");
const { getList } = require("../../../utils/functions/listGetters");
const {
  formatPageDescription,
} = require("../../../utils/functions/formatPageDescription");
const { buildContents } = require("../../../utils/builders");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

const {
  wrapContents,
  reversePipeContent,
} = require("../../../utils/compoundFunctions");
const reversePipe = (ctx) =>
  flow(wrapContents("contents"), reversePipeContent(ctx));

const getAllPageIds = (questionnaire) =>
  flatMap(questionnaire.sections, (section) =>
    flatMap(section.folders, (folder) =>
      flatMap(folder.pages, (page) => ({
        sectionId: section.id,
        pageId: page.id,
      }))
    )
  );

const getNextBlockId = (page, ctx) => {
  let blockId;
  const pageIds = getAllPageIds(ctx.questionnaireJson);
  const sectionId = find(pageIds, { pageId: page.id }).sectionId;
  const pageIndex = findIndex(pageIds, { pageId: page.id });
  if (
    pageIds[pageIndex + 1] &&
    pageIds[pageIndex + 1].sectionId === sectionId
  ) {
    blockId = pageIds[pageIndex + 1].pageId;
  }

  return blockId;
};

class DrivingQuestion {
  constructor(page, pages, ctx) {
    this.id = `question-driving-${pages[pages.length - 1].id}`;
    this.type = "General";
    this.title = processPipe(ctx)(page.title);
    if (page.additionalGuidanceEnabled && page.additionalGuidanceContent) {
      this.guidance = reversePipe(ctx)(page.additionalGuidanceContent);
    }

    const list = getList(ctx, page.listId);
    this.answers = [
      {
        id: `answer${page.answers[0].id}`,
        mandatory: true,
        type: "Radio",
        options: [
          {
            label: page.answers[0].options[0].label,
            value: page.answers[0].options[0].label,
            action: {
              type: "RedirectToListAddBlock",
              params: {
                block_id: `add-block-${formatPageDescription(
                  pages[1].pageDescription
                )}`,
                list_name: list.listName,
              },
            },
          },
          {
            label: page.answers[0].options[1].label,
            value: page.answers[0].options[1].label,
          },
        ],
      },
    ];
    if (page.answers[0].options[0].description) {
      this.answers[0].options[0].description = buildContents(
        page.answers[0].options[0].description,
        ctx
      );
    }
    if (page.answers[0].options[1].description) {
      this.answers[0].options[1].description = buildContents(
        page.answers[0].options[1].description,
        ctx
      );
    }
  }

  static routingRules(page, pages, ctx) {
    const nextBlockId = getNextBlockId(pages[pages.length - 1], ctx);

    let routingDest = {};

    if (nextBlockId) {
      routingDest.block = nextBlockId;
    } else {
      routingDest.section = "End";
    }
    routingDest.when = {
      in: [
        {
          source: "answers",
          identifier: `answer${page.answers[0].id}`,
        },
        [page.answers[0].options[1].label],
      ],
    };

    return [
      routingDest,
      {
        block: pages[pages.length - 1].id,
      },
    ];
  }
}

module.exports = DrivingQuestion;
