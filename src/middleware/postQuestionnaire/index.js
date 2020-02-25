module.exports = (req, res, next) => {
  if (
    Object.entries(req.body).length === 0 &&
    req.body.constructor === Object
  ) {
    return res.sendStatus(400);
  }
  res.locals.questionnaire = req.body;
  next();
};
