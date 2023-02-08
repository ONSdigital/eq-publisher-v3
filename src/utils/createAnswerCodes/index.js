const {
  CHECKBOX,
  RADIO,
  SELECT,
  MUTUALLY_EXCLUSIVE,
  DATE_RANGE,
} = require("../../constants/answerTypes");

// Get all answers in the questionnaire
const getAllAnswers = (questionnaireJson) => {
  const allQuestionnaireAnswers = [];
  questionnaireJson.sections.forEach((section) => {
    section.folders.forEach((folder) => {
      folder.pages.forEach((page) => {
        if (page.pageType === "QuestionPage") {
          page.answers.forEach((answer) => {
            allQuestionnaireAnswers.push(answer);
          });
        }
      });
    });
  });

  questionnaireJson.collectionLists.lists.forEach((list) => {
    list.answers.forEach((answer) => {
      allQuestionnaireAnswers.push(answer);
    });
  });

  return allQuestionnaireAnswers;
};

// Generates answer codes for all answers
const createAnswerCodes = (questionnaireJson) => {
  const answerCodes = [];
  const answers = getAllAnswers(questionnaireJson);

  // Loop through all answers in the questionnaire
  answers.forEach((answer) => {
    // Date range answers output an answer code for the from value, and an answer code for the to value
    if (answer.type === DATE_RANGE) {
      answerCodes.push({
        answer_id: `answer${answer.id}from`,
        code: answer.qCode,
      });
      answerCodes.push({
        answer_id: `answer${answer.id}to`,
        code: answer.secondaryQCode,
      });
    }
    // Other answer types output answer ID and answer QCode as their answer codes
    else {
      answerCodes.push({
        answer_id: `answer${answer.id}`,
        code: answer.qCode,
      });
      if ([RADIO, CHECKBOX, SELECT, MUTUALLY_EXCLUSIVE].includes(answer.type)) {
        answer.options.forEach((option) => {
          if (
            option.additionalAnswer !== undefined &&
            option.additionalAnswer !== null
          ) {
            answerCodes.push({
              answer_id: `answer${option.additionalAnswer.id}`,
              code: option.additionalAnswer.qCode,
            });
          }
        });
      }
    }
  });

  return answerCodes;
};

module.exports = createAnswerCodes;
