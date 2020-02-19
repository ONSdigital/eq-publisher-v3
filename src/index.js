const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const pino = require("express-pino-logger");

const {
  convertSchema,
  postQuestionnaire,
  respondWithData,
  validation,
  status
} = require("./middleware");

dotenv.config();

const logger = pino();
const app = express();

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

app.get("/status", status);

app.post("/publish", logger, postQuestionnaire, convertSchema, respondWithData);

app.post(
  "/convert/validate",
  postQuestionnaire,
  convertSchema,
  respondWithData,
  validation
);

const PORT = process.env.PORT || 9000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Listening on port", PORT); // eslint-disable-line
});
