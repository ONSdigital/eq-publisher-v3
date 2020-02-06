const { version } = require("../../package.json");

module.exports = (_, res) => res.status(200).send({ status: "OK", version });
