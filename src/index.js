const express = require("express");
const helmet = require("helmet");
const {
  convertSchema,
  fetchQuestionnaire,
  respondWithData,
  status
} = require("./middleware");

const questionnaireJSON = require("../authorTest.json");

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

// const Hub = require("./eq_schema/schema/Hub");
// const test = false;
// const hub = new Hub(test);
// console.log(hub);
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
