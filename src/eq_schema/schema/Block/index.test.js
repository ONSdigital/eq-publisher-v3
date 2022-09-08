const Block = require(".");
const { isLastPageInSection } = require(".");
const Question = require("../Question");
const ctx = {};

describe("Block", () => {
  const createBlockJSON = block =>
    Object.assign(
      {
        id: 1,
        pageType: "QuestionPage",
        type: "General",
        answers: []
      },
      block
    );

  const createPipedFormat = (placeholder, identifier, source) => ({
    text: `{${placeholder}}`,
    placeholders: [
      {
        placeholder,
        value: {
          identifier: identifier,
          source
        }
      }
    ]
  });

  it("should build valid runner Block from Author page", () => {
    const block = new Block(createBlockJSON(), ctx);

    expect(block).toMatchObject({
      // id: "block1",
      question: expect.any(Question)
    });
  });

  it("should not have a title", () => {
    const block = new Block(createBlockJSON(), ctx);

    expect(block.title).toBeUndefined();
  });

  it("should not build routing rules when there is a confirmation page", () => {
    const block = new Block(
      createBlockJSON({
        confirmation: {
          id: "2",
          title: "<p>Are you sure?</p>"
        },
        routing: { id: "2" }
      }),
      ctx
    );

    expect(block.routing_rules).toBeUndefined();
  });

  describe("conversion of page types", () => {
    it("should convert QuestionPage to Questionnaire", () => {
      const block = new Block(
        createBlockJSON({ pageType: "QuestionPage" }),
        ctx
      );
      expect(block.type).toEqual("Question");
    });

    it("should convert InterstitialPage to Interstitial", () => {
      const block = new Block(
        createBlockJSON({ pageType: "InterstitialPage" }),
        ctx
      );

      expect(block.type).toEqual("Interstitial");
    });
  });

  describe("isNotLastPageInSection", () => {
    const questionnaire = {
      sections: [
        {
          pages: [{ id: "1" }, { id: "2" }]
        },
        {
          pages: [{ id: "3" }, { id: "4" }]
        }
      ]
    };

    it("should return true if is a last page", () => {
      expect(isLastPageInSection({ id: "2" }, questionnaire)).toBe(true);
      expect(isLastPageInSection({ id: "4" }, questionnaire)).toBe(true);
    });

    it("should return false if not a last page in a section", () => {
      expect(isLastPageInSection({ id: "1" }, questionnaire)).toBe(false);
      expect(isLastPageInSection({ id: "3" }, questionnaire)).toBe(false);
    });
  });

  describe("piping", () => {
    const createPipeInText = ({
      id = 1,
      text = "foo",
      pipeType = "answers"
    } = {}) => `<span data-piped="${pipeType}" data-id="${id}">${text}</span>`;

    const createPipeInHtml = ({
      id = 1,
      text = "foo",
      pipeType = "answers",
      element = "h2"
    } = {}) =>
      `<${element}><span data-piped="${pipeType}" data-id="${id}">${text}</span></${element}>`;

    const createContext = (
      metadata = [{ id: "123", type: "Text", key: "my_metadata" }]
    ) => ({
      questionnaireJson: {
        metadata,
        sections: [{
          folders: [
            {
              id: "folder-1",
              pages: [{ answers: [{ id: `1`, type: "Text" }] }]
            }
          ],
        }]
      }
    });

    it("should handle piped values in title", () => {
      const introBlock = Block.buildIntroBlock(
        createPipeInText(),
        "",
        0,
        createContext()
      );
      expect(introBlock.content.title).toEqual(
        createPipedFormat("1", "answer1", "answers")
      );
    });

    it("should handle piped values in title while stripping html", () => {
      const introBlock = Block.buildIntroBlock(
        createPipeInHtml(),
        "",
        0,
        createContext()
      );

      expect(introBlock.content.title).toEqual(
        createPipedFormat("1", "answer1", "answers")
      );
    });

    it("should handle piped values in description", () => {
      const introBlock = Block.buildIntroBlock(
        "",
        `<ul>${createPipeInHtml({ element: "li" })}<li>Some Value</li</ul>`,
        0,
        createContext()
      );
      expect(introBlock.content.contents[0].list).toEqual([
        createPipedFormat("1", "answer1", "answers"),
        "Some Value"
      ]);
    });

    it("should build a calculated summary page", () => {
      const calculatedPageGraphql = {
        id: "1",
        title:
          '<p>Hi is your total <span data-piped="variable"data-id="total">[Total]</span></p>',
        pageType: "CalculatedSummaryPage",
        totalTitle: "<p>Bye</p>",
        summaryAnswers: ["1", "2", "3"]
      };
      const block = new Block(calculatedPageGraphql, ctx);
      expect(block).toMatchObject({
        calculation: {
          answers_to_calculate: ["answer1", "answer2", "answer3"],
          calculation_type: "sum",
          title: "Bye"
        },
        // id: "block1",
        title: "Hi is your total %(total)s",
        type: "CalculatedSummary"
      });
    });
  });
});
