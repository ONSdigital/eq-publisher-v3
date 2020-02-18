const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const dotenv = require("dotenv");

const {
  convertSchema,
  createAuthToken,
  fetchQuestionnaire,
  respondWithData,
  validation,
  status
} = require("./middleware");
const { fetchData, getQuestionnaire } = fetchQuestionnaire;

dotenv.config();

const app = express();

// app.use(
//   bodyParser.urlencoded({
//     extended: true
//   })
// );
app.use(bodyParser.json());

app.use(
  helmet({
    referrerPolicy: {
      policy: "no-referrer"
    },
    frameguard: {
      action: "deny"
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'none'"]
      }
    }
  })
);

const PORT = process.env.PORT || 9000;

app.get("/status", status);

app.post(
  "/blob",
  (req, res, next) => {
    console.log(req.body, "body");
    res.locals.questionnaire = req.body.data.questionnaire;
    next();
    // return res.status(200).send("WAAAAAaaaggggghhh");
  },
  convertSchema,
  respondWithData
);

app.get(
  "/convert/:questionnaireId",
  createAuthToken,
  fetchData(getQuestionnaire(process.env.EQ_AUTHOR_API_URL)),
  convertSchema,
  respondWithData
);
app.get(
  "/validate/:questionnaireId",
  createAuthToken,
  fetchData(getQuestionnaire(process.env.EQ_AUTHOR_API_URL)),
  convertSchema,
  validation,
  respondWithData
);

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Listening on port", PORT); // eslint-disable-line
});
