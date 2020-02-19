module.exports = (req, res, next) => {
  if (!req.body) {
    return res.sendStatus(400);
  }
  res.locals.questionnaire = req.body;
  next();
};
