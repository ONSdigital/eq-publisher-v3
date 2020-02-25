const Block = require("../../schema/Block");
const { CHECKBOX, RADIO } = require("../../../constants/answerTypes");

const buildAuthorConfirmationQuestion = (
  page,
  groupId,
  routing,
  ctx
) => {
  const confirmationAnswerObject = {
    id: `confirmation-answer-for-${page.id}`,
    type: RADIO,
    properties: {
      required: true
    },
    options: [
      {
        id: "positive-confirmation",
        label: page.confirmation.positive.label,
        description: page.confirmation.positive.description,
        value: page.confirmation.positive.label
      },
      {
        id: "negative-confirmation",
        label: page.confirmation.negative.label,
        description: page.confirmation.negative.description,
        value: page.confirmation.negative.label
      }
    ]
  };

  const confirmationBackwardsRouting2Rule = {
    expressionGroup: {
      operator: "OR",
      expressions: [
        {
          left: {
            id: `confirmation-answer-for-${page.id}`,
            type: RADIO
          },
          condition: "OneOf",
          right: {
            options: [
              {
                label: page.confirmation.negative.label
              }
            ]
          }
        }
      ]
    },
    destination: {
      page: {
        id: page.id
      }
    }
  };

  if (!routing) {
    routing = {
      id: "default-rule-set",
      else: {
        logical: "NextPage"
      },
      rules: []
    };
  }

  routing.rules.unshift(confirmationBackwardsRouting2Rule);


  const confirmationQuestionObject = {
    id: `confirmation-page-for-${page.id}`,
    title: page.confirmation.title,
    descriptionEnabled: true,
    description:
      page.answers[0].type === CHECKBOX
        ? `{{ answers['answer${page.answers[0].id}']|format_unordered_list }}`
        : null,
    pageType: "ConfirmationQuestion",
    routing,
    answers: [confirmationAnswerObject]
  };

  if (page.confirmation.qCode) {
    confirmationAnswerObject.qCode = page.confirmation.qCode;
  }

  return new Block(confirmationQuestionObject, groupId, ctx);
};

module.exports = {
  buildAuthorConfirmationQuestion
};
