const convertPipes = require("../../utils/convertPipes");
const getAllAnswers = require("../../utils/convertPipes").getAllAnswers;
const newPipes = require("../../utils/convertPipes").newPipes;

const createPipe = ({ pipeType = "answers", id = 1, text = "foo" } = {}) =>
  `<span data-piped="${pipeType}" data-id="${id}">${text}</span>`;

const createPlaceholders = ({ placeholder, source }, extra) => ({
  placeholder,
  value: {
    identifier: placeholder,
    source
  },
  ...extra
});

const createTransformation = (
  { placeholder, source, argument, transform },
  extra
) => ({
  placeholder,
  transforms: [
    {
      arguments: {
        [argument]: {
          identifier: placeholder,
          source
        },
        ...extra
      },
      transform
    }
  ]
});

const createWrapper = (text, ...args) => ({
  text,
  placeholders: [...args]
});

const createContext = (metadata = []) => ({
  questionnaireJson: {
    metadata,
    sections: [
      {
        pages: [
          {
            answers: [
              { id: `1`, type: "Text" },
              { id: `2`, type: "Currency" },
              { id: `3`, type: "DateRange" },
              { id: `4`, type: "Date" },
              { id: `5`, type: "Number" }
            ]
          },
          {}
        ]
      }
    ]
  }
});

describe("getAllAnswers", () => {
  it("should retrieve all answers when one page is empty", () => {
    expect(getAllAnswers(createContext().questionnaireJson)).toEqual(
      createContext().questionnaireJson.sections[0].pages[0].answers
    );
  });
});

describe("convertPipes", () => {
  it("should handle empty strings", () => {
    expect(newPipes(createContext())("")).toEqual("");
  });

  it("should handle null values", () => {
    expect(newPipes(createContext())(null)).toBeNull();
  });

  it("should handle undefined values", () => {
    expect(newPipes(createContext())(undefined)).toBeUndefined();
  });

  it("should handle empty html tags", () => {
    expect(newPipes(createContext())("<p></p>")).toEqual("<p></p>");
  });

  it("should handle unknown pipe types", () => {
    expect(newPipes(createContext())(createPipe({ pipeType: "Foo" }))).toEqual(
      ""
    );
  });
  it("should handle empty answer in page", () => {
    expect(newPipes(createContext())("<p></p>")).toEqual("<p></p>");
  });

  describe("Answer pipes", () => {
    it("should convert relevant elements to pipe format", () => {
      const html = createPipe();
      expect(newPipes(createContext())(html)).toEqual(
        createWrapper(
          "{answer1}",
          createPlaceholders({
            placeholder: "answer1",
            source: "answers"
          })
        )
      );
    });

    it("should handle multiple piped values", () => {
      const pipe1 = createPipe();
      const pipe2 = createPipe({ id: "2", text: "bar" });
      const html = `${pipe1}${pipe2}`;

      expect(newPipes(createContext())(html)).toEqual(
        createWrapper(
          "{answer1}{answer2}",
          createPlaceholders({
            placeholder: "answer1",
            source: "answers"
          }),
          createTransformation({
            placeholder: "answer2",
            source: "answers",
            argument: "number",
            transform: "format_currency"
          })
        )
      );
    });

    it("should handle piped values amongst regular text", () => {
      const pipe1 = createPipe();
      const pipe2 = createPipe({ id: "2", text: "bar" });
      const html = `hello ${pipe1}${pipe2} world`;

      expect(newPipes(createContext())(html)).toEqual(
        createWrapper(
          "hello {answer1}{answer2} world",
          createPlaceholders({
            placeholder: "answer1",
            source: "answers"
          }),
          createTransformation({
            placeholder: "answer2",
            source: "answers",
            argument: "number",
            transform: "format_currency"
          })
        )
      );
    });

    describe("formatting", () => {
      it("should format Date Range answers with `format_date`", () => {
        const html = createPipe({ id: "3" });
        expect(newPipes(createContext())(html)).toEqual(
          createWrapper(
            "{answer3}",
            createTransformation({
              placeholder: "answer3",
              source: "answers",
              argument: "date_to_format",
              transform: "format_date"
            })
          )
        );
      });

      it("should format Date answers with `format_date`", () => {
        const html = createPipe({ id: "4" });

        expect(newPipes(createContext())(html)).toEqual(
          createWrapper(
            "{answer4}",
            createTransformation(
              {
                placeholder: "answer4",
                source: "answers",
                argument: "date_to_format",
                transform: "format_date"
              },
              { date_format: "d MMMM yyyy" }
            )
          )
        );
      });

      it("should format Currency answers with `format_currency`", () => {
        const html = createPipe({ id: "2" });
        expect(newPipes(createContext())(html)).toEqual(
          createWrapper(
            "{answer2}",
            createTransformation({
              placeholder: "answer2",
              source: "answers",
              argument: "number",
              transform: "format_currency"
            })
          )
        );
      });

      it("should format Number answers with `format_number`", () => {
        const html = createPipe({ id: "5" });
        expect(newPipes(createContext())(html)).toEqual(
          createWrapper(
            "{answer5}",
            createTransformation({
              placeholder: "answer5",
              source: "answers",
              argument: "number",
              transform: "format_number"
            })
          )
        );
      });
    });
  });

  describe("Metadata pipes", () => {
    it("should convert a metdata to the correct pipe format", () => {
      const html = createPipe({ id: "123", pipeType: "metadata" });
      const metadata = [{ id: "123", key: "my_metadata", type: "Text" }];
      expect(newPipes(createContext(metadata))(html)).toEqual(
        createWrapper(
          `{${metadata[0].key}}`,
          createPlaceholders({
            placeholder: metadata[0].key,
            source: "metadata"
          })
        )
      );
    });

    it("should ignore non-existant metadata", () => {
      const html = createPipe({ pipeType: "metadata" });
      const metadata = [{ id: "456", key: "my_metadata", type: "Text" }];
      expect(newPipes(createContext(metadata))(html)).toEqual("");
    });

    describe("formatting", () => {
      it("should format date metadata as date", () => {
        const html = createPipe({ id: "123", pipeType: "metadata" });
        const metadata = [{ id: "123", key: "my_metadata", type: "Date" }];
        expect(newPipes(createContext(metadata))(html)).toEqual(
          createWrapper(
            "{my_metadata}",
            createTransformation(
              {
                placeholder: "my_metadata",
                source: "metadata",
                argument: "date_to_format",
                transform: "format_date"
              },
              { date_format: "d MMMM yyyy" }
            )
          )
        );
      });
    });
  });
});
