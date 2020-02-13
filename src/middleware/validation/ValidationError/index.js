class ValidationError extends Error {
  constructor(message, input, result) {
    super(message);
    this.input = input;
    this.result = result;
  }

  toJSON() {
    return {
      message: this.message,
      validatorInput: this.input,
      validatorResult: this.result
    };
  }

  toString() {
    return this.message + "\n" + JSON.stringify(this.result);
  }
}

module.exports = ValidationError;
