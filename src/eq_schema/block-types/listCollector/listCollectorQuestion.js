const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { flow } = require("lodash/fp");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

class ListCollectorQuestion {
  constructor(page, ctx) {
    this.id = `list-collector-question-${page.id}`;
    this.type = "General";
    this.title = processPipe(ctx)(page.title);
    this.answers = [
      {
        id: `add-another-${page.id}`,
        mandatory: true,
        type: "Radio",
        options: [
          {
            label: page.answers[0].options[0].label,
            value: page.answers[0].options[0].label,
            action: {
              type: "RedirectToListAddBlock",
            },
          },
          {
            label: page.answers[0].options[1].label,
            value: page.answers[0].options[1].label,
          },
        ],
      },
    ];
  }
}

module.exports = ListCollectorQuestion;
