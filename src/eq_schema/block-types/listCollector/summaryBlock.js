const { find, filter } = require("lodash");
const { TEXTFIELD, RADIO, CHECKBOX } = require("../../../constants/answerTypes");

class SummaryBlock {
  constructor(page, ctx) {
    this.title = "Summary"
    const listAnswers = find(ctx.questionnaireJson.collectionLists.lists, { id: page.listId }).answers
    this.item_title = {
      text: `{item-text-${page.id}}`,
      placeholders: [
        {
          placeholder: `item-text-${page.id}`,
          transforms: [
            {
              arguments: {
                delimiter: "&nbsp;",
                list_to_concatenate: this.buildList(listAnswers)
              },
              transform: "concatenate_list"
            }
          ]
        }
      ]
    }
  }

  buildList(answers) {
    return filter(answers, (answer) => [TEXTFIELD, RADIO, CHECKBOX].includes(answer.type)).map((answer) => ({
      source: "answers",
      identifier: `answer${answer.id}`
    }));
  }
}

module.exports = SummaryBlock;
