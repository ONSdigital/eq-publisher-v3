const Block = require("../../schema/Block");
const { CHECKBOX, RADIO } = require("../../../constants/answerTypes");

const buildAuthorConfirmationQuestion = (page, groupId, routing, ctx) => {
  const confirmationAnswerObject = {
    id: `confirmation-answer-for-${page.id}`,
    type: RADIO,
    properties: {
      required: true,
    },
    options: [
      {
        id: "positive-confirmation",
        label: page.confirmation.positive.label,
        description: page.confirmation.positive.description,
        value: page.confirmation.positive.label,
      },
      {
        id: "negative-confirmation",
        label: page.confirmation.negative.label,
        description: page.confirmation.negative.description,
        value: page.confirmation.negative.label,
      },
    ],
  };

  const confirmationBackwardsRouting2Rule = {
    expressionGroup: {
      operator: "OR",
      expressions: [
        {
          left: {
            answerId: `confirmation-answer-for-${page.id}`,
            type: "Answer",
          },
          condition: "Equal",
          right: {
            customValue: {
              number: page.confirmation.negative.label,
            },
          },
        },
      ],
    },
    destination: {
      pageId: page.id,
    },
  };

  const checkBoxTransform = [{
    text: "{checkbox_answers}",
    placeholders: [
      {
        placeholder: "checkbox_answers",
        transforms: [
          {
            transform: "format_list",
            arguments: {
              list_to_format: {
                source: "answers",
                identifier: `answer${page.answers[0].id}`
              }
            }
          }
        ]
      }
    ]
  }]

  if (!routing) {
    routing = {
      id: "default-rule-set",
      else: {
        logical: "NextPage",
      },
      rules: [],
    };
  }

  routing.rules.unshift(confirmationBackwardsRouting2Rule);

  const confirmationQuestionObject = {
    id: `confirmation-page-for-${page.id}`,
    title: page.confirmation.title,
    descriptionEnabled: true,
    description: null,
    pageType: "ConfirmationQuestion",
    routing,
    answers: [confirmationAnswerObject],
  };

  if (page.skipConditions || page.confirmation.skipConditions) {
    confirmationQuestionObject.skipConditions = [
      ...(page.confirmation.skipConditions || []),
      ...(page.skipConditions || []),
    ];
  }

  if (page.confirmation.qCode) {
    confirmationAnswerObject.qCode = page.confirmation.qCode;
  }

  const confirmationQuestionBlock = new Block(confirmationQuestionObject, groupId, ctx);
  if (page.answers[0].type === CHECKBOX ) {
    confirmationQuestionBlock.question.description = checkBoxTransform;
  }
  
  return confirmationQuestionBlock;
};

module.exports = {
  buildAuthorConfirmationQuestion,
};
