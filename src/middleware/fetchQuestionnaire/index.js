const fetchQuestionnaire = json => async (req, res, next) => {
  const { questionnaire } = json.data;
  res.locals.questionnaire = questionnaire;
  next();
};

module.exports = fetchQuestionnaire;
