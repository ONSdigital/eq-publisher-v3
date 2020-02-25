const Confirmation = require(".");

describe("Confirmation", () => {
  it("should build valid runner Confirmation", () => {
    const confirmation = new Confirmation();
    expect(confirmation).toMatchSnapshot();
  });
});
