const express = require("express");
const app = express();

const questionnaireJSON = require("../authorTest.json");

const {
  convertSchema,
  fetchQuestionnaire,
  respondWithData,
  status
} = require("./middleware");

const PORT = process.env.PORT || 9000;

app.get("/status", status);

app.get(
  "/testpoint",
  fetchQuestionnaire(questionnaireJSON),
  convertSchema,
  respondWithData
);

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Listening on port", PORT); // eslint-disable-line
});
