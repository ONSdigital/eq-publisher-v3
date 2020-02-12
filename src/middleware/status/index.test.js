const status = require(".");
const { version } = require("../../../package.json");
const mockResponse = require("../../mocks/response");

describe("Contacting the /status endpoint", () => {
  describe("if the application is running OK", () => {
    it("should return a status code 200", async () => {
      const res = mockResponse();
      await status(null, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    it(`should have the current app version number, ${version}, and 'OK' within the payload`, async () => {
      const res = mockResponse();
      await status(null, res);
      expect(res.send).toHaveBeenCalledWith({ status: "OK", version });
    });
  });
});
