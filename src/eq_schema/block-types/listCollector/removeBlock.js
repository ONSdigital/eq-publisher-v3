class RemoveBlock {
  constructor(page, ctx) {
    this.id = `remove-block-${page.id}`
    this.type = "ListRemoveQuestion"
    this.cancel_text = "Don’t need to remove this item?"
    this.question = {
      id: `remove-block-question-${page.id}`,
      type: "General",
      title: "Are you sure you want to remove this item?",
      page_title: `Are you sure you want to remove this item? - ${ctx.questionnaireJson.title}`,
      warning: "All of the information about this item will be deleted",
      answers: [{
        id: `remove-confirmation-${page.id}`,
        mandatory: true,
        type: "Radio",
        options: [
          {
            label: "Yes",
            value: "Yes",
            action: {
              type: "RemoveListItemAndAnswers"
            }
          },
          {
            label: "No",
            value: "No"
          }
        ]
      }]
    }
  }
}

module.exports = RemoveBlock;
