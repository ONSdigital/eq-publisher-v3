const express = require("express");
const app = express();

const questionnaireJSON = require("../authorTest.json");

const status = require("./middleware/status");
const respondWithData = require("./middleware/respondWithData");
const schemaConverter = require("./middleware/schemaConverter");

const SchemaValidator = require("./validation/SchemaValidator");
const ValidationApi = require("./validation/ValidationApi");

const Convert = require("./Convert");

const converter = new Convert(
  new SchemaValidator(new ValidationApi(process.env.EQ_SCHEMA_VALIDATOR_URL))
);

/*
  make a dummy fetch data here
  pass in the json data
  set the locals part of the res object to accept the questionnaire
  .i.e res.locals.questionnaire = questionnaire
  then return next()
*/
const { get, set } = require("lodash");
const fetchLocalData = json => async (req, res, next) => {
  const questionnaire = get(json, "data.questionnaire");
  set(res, "locals.questionnaire", questionnaire);
  next();
};

const PORT = process.env.PORT || 9000;

app.get("/status", status);

app.get(
  "/testpoint",
  fetchLocalData(questionnaireJSON),
  schemaConverter(converter),
  respondWithData,
  (req, res) => {
    res.send("hello");
  }
);

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Listening on port", PORT); // eslint-disable-line
});
