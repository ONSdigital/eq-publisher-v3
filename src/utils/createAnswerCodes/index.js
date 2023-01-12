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
    answerCodes.push({
      answer_id: answer.id,
      code: answer.qCode,
    });
  });
  return answerCodes;
};

module.exports = createAnswerCodes;
