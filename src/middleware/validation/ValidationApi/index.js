const request = require("request-promise");
const { get } = require("lodash/fp");

const getValidationErrors = get("response.body.errors");

class ValidationApi {
  constructor(validationApiUrl, http = request) {
    this.validationApiUrl = validationApiUrl;
    this.http = http;
  }

  async validate(json) {
    console.log(json);
    console.log(this.validationApiUrl);

    const test = await this.http
      .post(this.validationApiUrl, {
        body: json,
        json: true
      })
      .then(() => ({
        valid: true
      }))
      .catch(e => ({
        valid: false,
        errors: getValidationErrors(e)
      }));
    console.log(test);
    return test;
  }
}

module.exports = ValidationApi;
