const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { flow } = require("lodash/fp");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

class DrivingQuestion {
  constructor(page, ctx) {
    this.id = `question-driving-${page.id}`
    this.type = "General"
    this.title = processPipe(ctx)(page.drivingQuestion)
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
              "list_name": page.listId
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

  static routingRules(page){
    const routingDest = {
      section: "End",
      when: [
        {
          id: `answer-driving-${page.id}`,
          condition: "equals",
          value: page.drivingNegative
        }
      ]
    }

    return [
      {
        goto: routingDest
      },
      {
        goto: {
          block: `block${page.id}`
        }
      }
    ]
  }

}

module.exports = DrivingQuestion;