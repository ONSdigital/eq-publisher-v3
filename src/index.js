const express = require("express");
const helmet = require("helmet");
const dotenv = require("dotenv");

const {
  convertSchema,
  createAuthToken,
  fetchQuestionnaire,
  respondWithData,
  status
} = require("./middleware");
const { fetchData, getQuestionnaire } = fetchQuestionnaire;

dotenv.config();

const app = express();

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

app.get(
  "/testpoint/:questionnaireId",
  createAuthToken,
  fetchData(getQuestionnaire(process.env.EQ_AUTHOR_API_URL)),
  convertSchema,
  respondWithData
);

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Listening on port", PORT); // eslint-disable-line
});
