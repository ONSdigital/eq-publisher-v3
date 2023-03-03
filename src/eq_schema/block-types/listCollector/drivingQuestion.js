const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { flow } = require("lodash/fp");
const { flatMap, find, findIndex } = require("lodash");
const { getList } = require("../../../utils/functions/listGetters")

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
      flatMap(folder.pages, (page) => ({ sectionId: section.id, pageId: page.id }))
    )
  );

const getNextBlockId = (page, ctx) => {
  let blockId
  const pageIds = getAllPageIds(ctx.questionnaireJson)
  const sectionId = find(pageIds, { pageId: page.id }).sectionId
  const pageIndex = findIndex(pageIds, { pageId: page.id })
  if (pageIds[pageIndex + 1] &&
    (pageIds[pageIndex + 1]).sectionId === sectionId) {
    blockId = pageIds[pageIndex + 1].pageId
  }

  return blockId
}

class DrivingQuestion {
  constructor(page, ctx) {
    this.id = `question-driving-${page.id}`
    this.type = "General"
    this.title = processPipe(ctx)(page.drivingQuestion)

    if (page.additionalGuidancePanelSwitch && page.additionalGuidancePanel) {
      this.guidance = reversePipe(ctx)(page.additionalGuidancePanel);
    }

    const list = getList(ctx, page.listId)
    this.answers = [{
      "id": `answer-driving-${page.id}`,
      "mandatory": true,
      "type": "Radio",
      "options": [
        {
          "label": page.drivingPositive,
          "value": page.drivingPositive,
          "action": {
            "type": "RedirectToListAddBlock",
            "params": {
              "block_id": `add-block-${page.id}`,
              "list_name": list.listName
            }
          }
        },
        {
          "label": page.drivingNegative,
          "value": page.drivingNegative
        }
      ]
    }]
  }

  static routingRules(page, ctx) {
    const nextBlockId = getNextBlockId(page, ctx)

    let routingDest = {}

    if (nextBlockId) {
      routingDest.block = `block${nextBlockId}`
    } else {
      routingDest.section = "End"
    }
    routingDest.when =
    {
      "in": [
        {
          source: "answers",
          identifier: `answer-driving-${page.id}`,
        },
        [
          page.drivingNegative
        ]
      ]
    }

    return [
      routingDest,
      {
        block: `block${page.id}`
      }
    ]
  }

}

module.exports = DrivingQuestion;