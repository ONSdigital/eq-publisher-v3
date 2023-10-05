const {
  ListCollectorQuestion,
  AddBlock,
  RepeatingBlock,
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
      id: "follow-up-question-1",
      pageType: "QuestionPage",
      title: "Follow up question 1",
      pageDescription: "Follow up page title 1",
      answers: [
        {
          id: "answer-1",
          type: "Number",
          label: "Answer 1",
          properties: {
            required: false,
          },
        },
        {
          id: "answer-1",
          type: "TextField",
          label: "Answer 2",
          properties: {
            required: false,
          },
        },
      ],
      position: 2,
    },
    {
      id: "follow-up-question-2",
      pageType: "QuestionPage",
      title: "Follow up question 2",
      pageDescription: "Follow up page title 2",
      answers: [
        {
          id: "answer-3",
          type: "Number",
          label: "Answer 3",
          properties: {
            required: false,
          },
        },
        {
          id: "answer-4",
          type: "TextField",
          label: "Answer 4",
          properties: {
            required: false,
          },
        },
      ],
      position: 3,
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
      position: 4,
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
      listCollectorFolder.pages[4],
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

describe("Repeating Block", () => {
  it("should build the Repeating block", () => {
    const confirmation1 = new RepeatingBlock(
      listCollectorFolder.pages[2],
      createCtx()
    );
    const confirmation2 = new RepeatingBlock(
      listCollectorFolder.pages[3],
      createCtx()
    );
    expect(confirmation1).toMatchSnapshot();
    expect(confirmation2).toMatchSnapshot();
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
      listCollectorFolder.pages[4],
      createCtx()
    );
    expect(confirmation).toMatchSnapshot();
  });
});
