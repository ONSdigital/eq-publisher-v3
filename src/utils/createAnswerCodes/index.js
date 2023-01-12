const {
  CHECKBOX,
  RADIO,
  SELECT,
  MUTUALLY_EXCLUSIVE,
  DATE_RANGE,
} = require("../../constants/answerTypes");

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

const createAnswerCodes = (questionnaireJson) => {
  const answerCodes = [];
  const answers = getAllAnswers(questionnaireJson);
  answers.forEach((answer) => {
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
    } else if (answer.type === DATE_RANGE) {
      answerCodes.push({
        answer_id: `answer${answer.id}from`,
        code: answer.qCode,
      });
      answerCodes.push({
        answer_id: `answer${answer.id}to`,
        code: answer.secondaryQCode,
      });
    } else {
      answerCodes.push({
        answer_id: `answer${answer.id}`,
        code: answer.qCode,
      });
    }
  });
  return answerCodes;
};

module.exports = createAnswerCodes;
