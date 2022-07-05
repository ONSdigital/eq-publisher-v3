const convertPipes = require("../../utils/convertPipes");
const getAllAnswers = require("../../utils/convertPipes").getAllAnswers;

const createPipe = ({ pipeType = "answers", id = 1, text = "foo" } = {}) =>
  `<span data-piped="${pipeType}" data-id="${id}">${text}</span>`;

const createPlaceholders = ({ placeholder, source }, extra) => ({
  placeholder,
  value: {
    identifier: placeholder,
    source,
  },
  ...extra,
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
          source,
        },
        ...extra,
      },
      transform,
    },
  ],
});

const createCheckboxTransformation = (
  { placeholder, transform },
  extra
) => ({
  placeholder,
  transforms: [
    {
      arguments: {
        ...extra,
      },
      transform,
    },
  ],
});

const createWrapper = (text, ...args) => ({
  text,
  placeholders: [...args],
});

const createContext = (metadata = []) => ({
  questionnaireJson: {
    metadata,
    sections: [
      {
        folders: [
          {
            pages: [
              {
                answers: [
                  { id: `1`, type: "Text" },
                  { id: `2`, type: "Currency" },
                  { id: `3`, type: "DateRange" },
                  {
                    id: `4`,
                    type: "Date",
                    properties: { format: "dd/mm/yyyy" },
                  },
                  { id: `5`, type: "Number" },
                  { id: `6`, type: "Unit", properties: { unit: "Kilometres" } },
                  {
                    "id": `7`, "type": "Checkbox",
                    "options": [
                      {
                        id: `AppleId`,
                        label: "Apples"
                      },
                      {
                        id: `PearId`,
                        label: "Pears"
                      },
                      {
                        id: `OrangeId`,
                        label: "Oranges"
                      }
                    ]
                  },
                ],
              },
              {
                id: 'calc1',
                pageType: "CalculatedSummaryPage", 
                type: "Number"
              },
            ],
          },
        ],
      },
    ],
  },
});

describe("getAllAnswers", () => {
  it("should retrieve all answers when one page is empty", () => {
    expect(getAllAnswers(createContext().questionnaireJson)).toEqual(
      createContext().questionnaireJson.sections[0].folders[0].pages[0].answers
    );
  });
});

describe("convertPipes", () => {
  it("should handle empty strings", () => {
    expect(convertPipes(createContext())("")).toEqual("");
  });

  it("should handle null values", () => {
    expect(convertPipes(createContext())(null)).toBeNull();
  });

  it("should handle undefined values", () => {
    expect(convertPipes(createContext())(undefined)).toBeUndefined();
  });

  it("should handle empty html tags", () => {
    expect(convertPipes(createContext())("<p></p>")).toEqual("<p></p>");
  });

  it("should handle unknown pipe types", () => {
    expect(
      convertPipes(createContext())(createPipe({ pipeType: "Foo" }))
    ).toEqual("");
  });
  it("should handle empty answer in page", () => {
    expect(convertPipes(createContext())("<p></p>")).toEqual("<p></p>");
  });

  describe("Answer pipes", () => {
    it("should convert relevant elements to pipe format", () => {
      const html = createPipe();
      expect(convertPipes(createContext())(html)).toEqual(
        createWrapper(
          "{answer1}",
          createPlaceholders({
            placeholder: "answer1",
            source: "answers",
          })
        )
      );
    });

    it("should handle multiple piped values", () => {
      const pipe1 = createPipe();
      const pipe2 = createPipe({ id: "2", text: "bar" });
      const html = `${pipe1}${pipe2}`;

      expect(convertPipes(createContext())(html)).toEqual(
        createWrapper(
          "{answer1}{answer2}",
          createPlaceholders({
            placeholder: "answer1",
            source: "answers",
          }),
          createTransformation({
            placeholder: "answer2",
            source: "answers",
            argument: "number",
            transform: "format_currency",
          })
        )
      );
    });

    it("should handle piped values amongst regular text", () => {
      const pipe1 = createPipe();
      const pipe2 = createPipe({ id: "2", text: "bar" });
      const html = `hello ${pipe1}${pipe2} world`;

      expect(convertPipes(createContext())(html)).toEqual(
        createWrapper(
          "hello {answer1}{answer2} world",
          createPlaceholders({
            placeholder: "answer1",
            source: "answers",
          }),
          createTransformation({
            placeholder: "answer2",
            source: "answers",
            argument: "number",
            transform: "format_currency",
          })
        )
      );
    });

    describe("formatting", () => {
      it("should format Date Range answers with `format_date`", () => {
        const html = createPipe({ id: "3" });
        expect(convertPipes(createContext())(html)).toEqual(
          createWrapper(
            "{answer3}",
            createTransformation(
              {
                placeholder: "answer3",
                source: "answers",
                argument: "date_to_format",
                transform: "format_date",
              },
              { date_format: "d MMMM yyyy" }
            )
          )
        );
      });

      it("should format Date answers with `format_date`", () => {
        const html = createPipe({ id: "4" });
        expect(convertPipes(createContext())(html)).toEqual(
          createWrapper(
            "{answer4}",
            createTransformation(
              {
                placeholder: "answer4",
                source: "answers",
                argument: "date_to_format",
                transform: "format_date",
              },
              { date_format: "d MMMM yyyy" }
            )
          )
        );
      });

      it("should format Currency answers with `format_currency`", () => {
        const html = createPipe({ id: "2" });
        expect(convertPipes(createContext())(html)).toEqual(
          createWrapper(
            "{answer2}",
            createTransformation({
              placeholder: "answer2",
              source: "answers",
              argument: "number",
              transform: "format_currency",
            })
          )
        );
      });

      it("should format Number answers with `format_number`", () => {
        const html = createPipe({ id: "5" });
        expect(convertPipes(createContext())(html)).toEqual(
          createWrapper(
            "{answer5}",
            createTransformation({
              placeholder: "answer5",
              source: "answers",
              argument: "number",
              transform: "format_number",
            })
          )
        );
      });

      it("should format Checkbox answers with `format_checkbox`", () => {
        const html = createPipe({ id: "7" });
        expect(convertPipes(createContext())(html)).toEqual(
          createWrapper(
            "{answer7}",
            createCheckboxTransformation({
              placeholder: "answer7",
              transform: "concatenate_list",
            },
              {
                delimiter: ",&nbsp;",
                list_to_concatenate: {
                  identifier: "answer7",
                  source: "answers"
                }
              }
            )
          ),
        );
      });


      // Put in when Unit in runner
      // it("should format Unit answers with `unit`", () => {
      //   const html = createPipe({ id: "6" });
      //   const runnerJSON = createWrapper(
      //     "{answer6}",
      //     createTransformation({
      //       placeholder: "answer6",
      //       source: "answers",
      //       argument: "number",
      //       transform: "format_unit",
      //     })
      //   );

      //   runnerJSON.placeholders[0].transforms[0].arguments.unit =
      //     "length-kilometer";

      //   expect(convertPipes(createContext())(html)).toEqual(runnerJSON);
      // });
    });
  });

  describe("Metadata pipes", () => {
    it("should convert a metdata to the correct pipe format", () => {
      const html = createPipe({ id: "123", pipeType: "metadata" });
      const metadata = [{ id: "123", key: "my_metadata", type: "Text" }];
      expect(convertPipes(createContext(metadata))(html)).toEqual(
        createWrapper(
          `{${metadata[0].key}}`,
          createPlaceholders({
            placeholder: metadata[0].key,
            source: "metadata",
          })
        )
      );
    });

    it("should ignore non-existant metadata", () => {
      const html = createPipe({ pipeType: "metadata" });
      const metadata = [{ id: "456", key: "my_metadata", type: "Text" }];
      expect(convertPipes(createContext(metadata))(html)).toEqual("");
    });

    describe("Variable pipes", () => {
      it("should convert a variable with unique id to the correct pipe format", () => {
        const html = createPipe({ id: "calc1", pipeType: "variable"});
        expect(convertPipes(createContext())(html)).toEqual(
          createWrapper(
            "{blockcalc1}",
            createTransformation({
              placeholder: "blockcalc1",
              source: "calculated_summary",
              argument: "number",
              transform: "format_number",
            })
          )
        );
      });

      it("should convert a variable with id as total to the correct pipe format", () => {
        const html = createPipe({ id: "total", pipeType: "variable"});
        expect(convertPipes(createContext())(html)).toEqual(
          "%(total)s"
        );
      });

    });

    describe("formatting", () => {
      it("should format date metadata as date", () => {
        const html = createPipe({ id: "123", pipeType: "metadata" });
        const metadata = [{ id: "123", key: "my_metadata", type: "Date" }];

        expect(convertPipes(createContext(metadata))(html)).toEqual(
          createWrapper(
            "{my_metadata}",
            createTransformation(
              {
                placeholder: "my_metadata",
                source: "metadata",
                argument: "date_to_format",
                transform: "format_date",
              },
              { date_format: "d MMMM yyyy" }
            )
          )
        );
      });
    });
  });
});
