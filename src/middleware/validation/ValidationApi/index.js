const request = require("request-promise");
const { get } = require("lodash/fp");

const getValidationErrors = get("response.body.errors");

class ValidationApi {
  constructor(validationApiUrl, http = request) {
    this.validationApiUrl = validationApiUrl;
    this.http = http;
  }

  async validate(json) {
    return this.http
      .post(this.validationApiUrl, {
        body: json,
        json: true
      })
      .then(res => {
        if (Object.entries(res).length > 0) {
          return res;
        }
        return res;
      })
      .catch(e => ({
        valid: false,
        errors: getValidationErrors(e)
      }));
  }
}

module.exports = ValidationApi;
