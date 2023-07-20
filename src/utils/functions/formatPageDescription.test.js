const {formatPageDescription} = require("./formatPageDescription")

describe("Formatting page description", () => {
  it("should remove leading and trailing spaces and format", () => {
    expect(formatPageDescription(" Leading and trailing spaces ")).toBe("leading-and-trailing-spaces");
  });
  it("should remove multiple in text spaces and format", () => {
    expect(formatPageDescription("Extra     spaces")).toBe("extra-spaces");
  });
  it("should remove non-alpha-numeric characters and format", () => {
    expect(formatPageDescription("Question mark?")).toBe("question-mark");
    expect(formatPageDescription("!Exclamation")).toBe("exclamation");
    expect(formatPageDescription("One & Two")).toBe("one-two");
  });
  it("should change multiple dashes to single and format", () => {
    expect(formatPageDescription("Multiple-------Dashes")).toBe("multiple-dashes");
  });
  it("should change to all lowercase and format", () => {
    expect(formatPageDescription("IN UPPERCASE")).toBe("in-uppercase");
  });
  it("should change not remove hyphens", () => {
    expect(formatPageDescription("hyphenated-word")).toBe("hyphenated-word");
  });
});
