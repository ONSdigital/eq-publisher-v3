module.exports = function respondWithData(req, res) {
  const questionnaire = res.locals.questionnaire;
  res.json(questionnaire);
};
