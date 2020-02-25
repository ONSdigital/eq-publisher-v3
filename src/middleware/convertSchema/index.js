const Questionnaire = require("../../eq_schema");

const convertSchema = (req, res, next) => {
  const convertedQuestionnaire = new Questionnaire(res.locals.questionnaire);
  res.locals.questionnaire = convertedQuestionnaire;
  next();
};

module.exports = convertSchema;
