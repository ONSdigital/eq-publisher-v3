const {
  formatPageDescription,
} = require("../../../utils/functions/formatPageDescription");

class RemoveBlock {
  constructor(page) {
    this.id = `remove-block-${formatPageDescription(page.pageDescription)}`;
    this.type = "ListRemoveQuestion";
    this.cancel_text = "Don’t need to remove this item?";
    this.question = {
      id: `remove-block-question-${formatPageDescription(
        page.pageDescription
      )}`,
      type: "General",
      title: "Are you sure you want to remove this item?",
      warning: "All of the information about this item will be deleted",
      answers: [
        {
          id: `remove-confirmation-${page.id}`,
          mandatory: true,
          type: "Radio",
          options: [
            {
              label: "Yes",
              value: "Yes",
              action: {
                type: "RemoveListItemAndAnswers",
              },
            },
            {
              label: "No",
              value: "No",
            },
          ],
        },
      ],
    };
  }
}

module.exports = RemoveBlock;
