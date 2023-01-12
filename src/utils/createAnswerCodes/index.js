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
        page.answers.forEach((answer) => {
          allQuestionnaireAnswers.push(answer);
        });
      });
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
    // Multiple choice answers output a code for the answer, and a code with answer_value for each option
    if ([RADIO, CHECKBOX, SELECT, MUTUALLY_EXCLUSIVE].includes(answer.type)) {
      answerCodes.push({
        answer_id: `answer${answer.id}`,
        code: answer.qCode,
      });
      answer.options.forEach((option) => {
        answerCodes.push({
          answer_id: `answer${answer.id}`,
          answer_value: option.value !== null ? option.value : option.label,
          code: answer.qCode,
        });
      });
    }
    // Date range answers output an answer code for the from value, and an answer code for the to value
    else if (answer.type === DATE_RANGE) {
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
    }
  });

  return answerCodes;
};

module.exports = createAnswerCodes;
