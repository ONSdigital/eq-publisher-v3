const { questionnaireJson } = require("../../basicQuestionnaireJSON");

const checkValidRoutingType = require(".");

describe("Should build a runner representation of a binary expression", () => {
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
        "any-in": [
          {
            identifier: "answer1",
            values: ["red"],
          },
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
          {
            identifier: "answer1",
            values: null,
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
        "any-in": [
          {
            identifier: "answer1",
            values: ["red", "white"],
          },
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
            source: "Answer",
          },
          5,
        ],
      });
    });

    it("can translate unanswered question routing from Author to Runner for all numeric types", () => {
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
            source: "Answer",
          },
          5,
        ],
      });
    });
  });
});
