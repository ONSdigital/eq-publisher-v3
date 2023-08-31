const {
  ListCollectorQuestion,
  AddBlock,
  DrivingQuestion,
  EditBlock,
  RemoveBlock,
  SummaryBlock,
} = require(".");

const listCollectorFolder = {
  id: "listcollector-1",
  listId: "list1",
  title: "List 1",
  pages: [
    {
      id: "qualifier-page",
      pageType: "ListCollectorQualifierPage",
      title: "Qualifier question",
      pageDescription: "List collector page title",
      listId: "list1",
      additionalGuidanceEnabled: true,
      additionalGuidanceContent: "<p>Additional guidance</p>",
      answers: [
        {
          id: "qualifier-answer",
          type: "Radio",
          options: [
            {
              id: "qualifier-positive-option",
              label: "Yes",
            },
            {
              id: "qualifier-negative-option",
              label: "No",
            },
          ],
        },
      ],
      position: 0,
    },
    {
      id: "add-item-page",
      pageType: "ListCollectorAddItemPage",
      title: "Enter details",
      pageDescription: "Add item page title",
      listId: "list1",
      position: 1,
    },
    {
      id: "confirmation-page",
      pageType: "ListCollectorConfirmationPage",
      title: "Add another",
      pageDescription: "Add another page title",
      listId: "list1",
      answers: [
        {
          id: "confirmation-answer",
          type: "Radio",
          options: [
            {
              id: "confirmation-positive-option",
              label: "Yes",
            },
            {
              id: "confirmation-negative-option",
              label: "No",
            },
          ],
        },
      ],
      position: 2,
    },
  ],
};

const createCtx = () => ({
  questionnaireJson: {
    id: "questionnaire-1",
    title: "Test Questionnaire",
    collectionLists: {
      lists: [
        {
          id: "list1",
          answers: [
            {
              id: "answer-1",
              displayName: "Answer 1",
              properties: {
                required: false,
              },
            },
          ],
        },
      ],
    },
  },
});

describe("list collector question", () => {
  it("should build valid list collector question", () => {
    const confirmation = new ListCollectorQuestion(
      listCollectorFolder.pages[2],
      createCtx()
    );
    expect(confirmation).toMatchSnapshot();
  });
});

describe("Driving Block", () => {
  it("should build the driving block", () => {
    const confirmation = new DrivingQuestion(
      listCollectorFolder.pages[0],
      listCollectorFolder.pages,
      createCtx()
    );
    expect(confirmation).toMatchSnapshot();
  });
});

describe("Add Block", () => {
  it("should build the Add block", () => {
    const confirmation = new AddBlock(
      listCollectorFolder.pages[1],
      createCtx()
    );
    expect(confirmation).toMatchSnapshot();
  });
});

describe("Edit Block", () => {
  it("should build the Edit block", () => {
    const confirmation = new EditBlock(
      listCollectorFolder.pages[1],
      createCtx()
    );
    expect(confirmation).toMatchSnapshot();
  });
});

describe("Remove Block", () => {
  it("should build the remove block", () => {
    const confirmation = new RemoveBlock(
      listCollectorFolder.pages[1],
      createCtx()
    );
    expect(confirmation).toMatchSnapshot();
  });
});

describe("Summary Block", () => {
  it("should build the Summary block", () => {
    const confirmation = new SummaryBlock(
      listCollectorFolder.pages[2],
      createCtx()
    );
    expect(confirmation).toMatchSnapshot();
  });
});
