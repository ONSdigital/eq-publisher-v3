const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { flow } = require("lodash/fp");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

class ListCollectorQuestion {
  constructor(page, ctx) {
    this.id = `list-collector-question-${page.id}`
    this.type = "General"
    this.title = processPipe(ctx)(page.anotherTitle)
    this.answers = [{
      "id": `add-another-${page.id}`,
      "mandatory": true,
      "type": "Radio",
      "options": [
        {
          "label": page.anotherPositive,
          "value": page.anotherPositive,
          "action": {
            "type": "RedirectToListAddBlock"
          }
        },
        {
          "label": page.anotherNegative,
          "value": page.anotherNegative
        }
      ]
    }]
  }
}

module.exports = ListCollectorQuestion;