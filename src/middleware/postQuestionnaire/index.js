module.exports = (req, res, next) => {
  if (!req.body.data) {
    return res.sendStatus(404);
  }
  const { questionnaire } = req.body.data;
  res.locals.questionnaire = questionnaire;
  next();
};
