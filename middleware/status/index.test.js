const status = require(".");
const { version } = require("../../package.json");

describe("Contacting the /status endpoint", () => {
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

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
