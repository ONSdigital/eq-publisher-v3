const translateRoutingDestination = require(".");
const {
  questionnaireJson,
  questionnaireJsonWithSummary,
} = require("../../basicQuestionnaireJSON");

describe("Translation of a routing destination", () => {
  it("should translate an absolute destination to another Page", () => {
    const ctx = {
      questionnaireJson: {
        sections: [{ folders: [{ pages: [{ id: "2" }] }] }],
      },
    };
    const authorDestination = {
      pageId: "2",
    };
    expect(
      translateRoutingDestination(
        authorDestination,
        authorDestination.pageId,
        ctx
      )
    ).toMatchObject({
      block: "block2",
    });
  });
  it("should translate an absolute destination to another Section", () => {
    const authorDestination = {
      sectionId: "2",
    };
    expect(
      translateRoutingDestination(authorDestination, "2", { questionnaireJson })
    ).toMatchObject({
      group: "group2",
    });
  });
  it("should translate a next page destination", () => {
    const authorDestination = {
      logical: "NextPage",
    };
    expect(
      translateRoutingDestination(authorDestination, "1", { questionnaireJson })
    ).toMatchObject({ block: "block2" });
  });

  it("should translate a next page destination when last page in section", () => {
    const authorDestination = {
      logical: "NextPage",
    };
    expect(
      translateRoutingDestination(authorDestination, "2", { questionnaireJson })
    ).toMatchObject({ group: "group2" });
  });

  it("should translate a next page destination as confirmation-group when last page in questionnaire", () => {
    const authorDestination = {
      logical: "NextPage",
    };
    expect(
      translateRoutingDestination(authorDestination, "3", { questionnaireJson })
    ).toMatchObject({ group: "confirmation-group" });
  });

  it("should translate a next page destination as summary when last page in questionnaire", () => {
    const authorDestination = {
      logical: "NextPage",
    };
    expect(
      translateRoutingDestination(authorDestination, "3", {
        questionnaireJson: questionnaireJsonWithSummary,
      })
    ).toMatchObject({ group: "summary-group" });
  });

  it("should fail if not provided any destinations", () => {
    const authorDestination = {};

    expect(() => translateRoutingDestination(authorDestination)).toThrow(
      "not a valid destination object"
    );
  });

  it("should fail if provided a non-valid logical type", () => {
    const authorDestination = { logical: "Foo" };

    expect(() => translateRoutingDestination(authorDestination)).toThrow(
      "not a valid destination type"
    );
  });
});
