const express = require("express");
const app = express();

const status = require("./middleware/status");

const PORT = process.env.PORT || 9000;

app.get("/status", status);

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Listening on port", PORT); // eslint-disable-line
});
