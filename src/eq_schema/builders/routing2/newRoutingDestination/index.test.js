const { questionnaireJson } = require("../../basicQuestionnaireJSON");

const checkValidRoutingType = require(".");

describe("Should build a runner representation of a binary expression", () => {
  describe("With answers", () => {
    it("should throw on unsupported answer type", () => {
      const expression = {
        left: {
          id: "1",
          type: "Text",
        },
        condition: "Equal",
        right: {
          number: 5,
        },
      };

      expect(() =>
        checkValidRoutingType(expression, { questionnaireJson })
      ).toThrow("not a valid routing answer type");
    });

    describe("With Radio answers", () => {
      const buildBinaryExpression = (optionIds, condition) => ({
        left: {
          answerId: "1",
          type: "Answer",
        },
        condition,
        right: {
          type: "SelectedOptions",
          optionIds,
        },
      });

      it("With a radio answer and single selected option", () => {
        const expression = buildBinaryExpression(["123"], "OneOf");
        const runnerExpression = checkValidRoutingType(expression, {
          questionnaireJson,
        });

        expect(runnerExpression).toMatchObject({
          in: [
            {
              identifier: "answer1",
              source: "answers",
            },
            ["red"],
          ],
        });
      });

      it("With a radio answer and no selected options", () => {
        const expression = buildBinaryExpression(["123", "456"], "Unanswered");
        const runnerExpression = checkValidRoutingType(expression, {
          questionnaireJson,
        });

        expect(runnerExpression).toMatchObject({
          "==": [
            null,
            {
              identifier: "answer1",
              source: "answers",
            },
          ],
        });
      });

      it("With a radio answer and multiple selected options", () => {
        const expression = buildBinaryExpression(["123", "456"], "OneOf");

        const runnerExpression = checkValidRoutingType(expression, {
          questionnaireJson,
        });
        expect(runnerExpression).toMatchObject({
          in: [
            {
              identifier: "answer1",
              source: "answers",
            },
            ["red", "white"],
          ],
        });
      });
    });

    describe("With Number based answers", () => {
      it("supports a custom value", () => {
        const expression = {
          left: {
            answerId: "1",
            type: "Answer",
          },
          condition: "Equal",
          right: {
            customValue: {
              number: 5,
            },
          },
        };
        const runnerExpression = checkValidRoutingType(expression, {
          questionnaireJson,
        });
        expect(runnerExpression).toMatchObject({
          "==": [
            {
              identifier: "answer1",
              source: "answers",
            },
            5,
          ],
        });
      });

      it("Checks that even though there's a number value stored on the right handside, the condition is unanswered, meaning the value should be null on the object", () => {
        const expression = {
          left: {
            answerId: "1",
            type: "Answer",
          },
          condition: "Unanswered",
          right: {
            customValue: {
              number: 5,
            },
          },
        };

        const runnerExpression = checkValidRoutingType(expression, {
          questionnaireJson,
        });

        expect(runnerExpression).toMatchObject({
          "==": [
            {
              identifier: "answer1",
              source: "answers",
            },
            null,
          ],
        });
      });
    });

    describe("With checkbox answers", () => {
      it("Excepts a checkbox count of answer and returns the correct object", () => {
        const expression = {
          secondaryCondition: "Equal",
          left: {
            answerId: "1",
            type: "Answer",
          },
          condition: "CountOf",
          right: {
            customValue: {
              number: 5,
            },
          },
        };

        const runnerExpression = checkValidRoutingType(expression, {
          questionnaireJson,
        });

        expect(runnerExpression).toMatchObject({
          "==": [
            {
              count: [
                {
                  source: "answers",
                  identifier: "answer1",
                },
              ],
            },
            5,
          ],
        });
      });
    });
  });

  describe("With metadata", () => {
    describe("Text metadata", () => {
      it("should return correct metadata object for text metadata", () => {
        const expression = {
          left: {
            metadataId: "metadata-1",
            type: "Metadata",
          },
          condition: "Matches",
          right: {
            type: "Custom",
            customValue: {
              text: "Test text",
            },
          },
        };

        const runnerExpression = checkValidRoutingType(expression, {
          questionnaireJson,
        });

        expect(runnerExpression).toMatchObject({
          "==": [
            {
              source: "metadata",
              identifier: "ru_name",
            },
            "Test text",
          ],
        });
      });
    });
  });
});
