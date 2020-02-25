module.exports = function respondWithData(req, res) {
  const questionnaire = res.locals.questionnaire;
  const trimmedQuestionnaire = JSON.parse(
    JSON.stringify(questionnaire).replace(/"\s+|\s+"/g, '"')
  );

  res.json(trimmedQuestionnaire);
};
