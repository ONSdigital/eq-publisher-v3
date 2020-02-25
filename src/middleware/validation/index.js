const SchemaValidator = require("./SchemaValidator");
const ApiValidator = require("./ValidationApi");

const validation = async (req, res, next) => {
  const api = new ApiValidator(process.env.EQ_VALIDATOR_URL);
  const validator = new SchemaValidator(api);
  const result = await validator.validate(res.locals.questionnaire);
  if (!result.valid) {
    return res.status(400).send(result);
  }
  next();
};

module.exports = validation;
