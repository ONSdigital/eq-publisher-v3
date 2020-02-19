module.exports = (req, res, next) => {
  if (!req.body.data) {
    return res.sendStatus(400);
  }
  const { questionnaire } = req.body.data;
  res.locals.questionnaire = questionnaire;
  next();
};
