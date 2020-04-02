const { wrapContents } = require(".");

describe("Compound functions", () => {
  describe("Wrap contents", () => {
    it("should return undefined if propName isn't correctly added", () => {
      expect(wrapContents("")("<p>Hello world</p>")).toBeUndefined();
      expect(wrapContents(null)("<p>Hello world</p>")).toBeUndefined();
      expect(wrapContents(undefined)("<p>Hello world</p>")).toBeUndefined();
      expect(wrapContents(false)("<p>Hello world</p>")).toBeUndefined();
    });
    it("should return undefined if content isn't correctly added", () => {
      expect(wrapContents("content")(null)).toBeUndefined();
      expect(wrapContents("content")(undefined)).toBeUndefined();
      expect(wrapContents("content")(false)).toBeUndefined();
    });
    it("should return undefined if content isn't valid html", () => {
      expect(wrapContents("content")("<p><p/>")).toBeUndefined();
    });
  });
});
