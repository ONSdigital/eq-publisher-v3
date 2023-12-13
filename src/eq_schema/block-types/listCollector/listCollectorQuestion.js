const convertPipes = require("../../../utils/convertPipes");
const { getInnerHTMLWithPiping } = require("../../../utils/HTMLUtils");
const { flow } = require("lodash/fp");
const { buildContents } = require("../../../utils/builders");

const processPipe = (ctx) => flow(convertPipes(ctx), getInnerHTMLWithPiping);

class ListCollectorQuestion {
  constructor(page, ctx) {
    this.id = `list-collector-question-${page.id}`;
    this.type = "General";
    this.title = processPipe(ctx)(page.title);
    this.answers = [
      {
        id: `add-another-${page.answers[0].id}`,
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
}

module.exports = ListCollectorQuestion;
