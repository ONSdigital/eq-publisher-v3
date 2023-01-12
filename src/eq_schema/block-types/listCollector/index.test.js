const {
  ListCollectorQuestion, 
  AddBlock,
  EditBlock,
  RemoveBlock,
  SummaryBlock
 } = require(".");

const createListCollectorPage = () => ({
  id: "listcollector-1",
  listId: "list1",
  anotherTitle: "Add another",
  anotherPositive: "Yes",
  anotherNegative: "No",
  addItemTitle: "Enter details"
})

const createCtx = () => ({
  questionnaireJson: {
    id: "questionnaire-1",
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
            }
          }
        ]
      }]
    }
  }
})

describe("list collector question", () => {
  it("should build valid list collector question", () => {
    const confirmation = new ListCollectorQuestion(createListCollectorPage());
    expect(confirmation).toMatchSnapshot();
  });
});

describe("Add Block", () => {
  it("should build the Add block", () => {
    const confirmation = new AddBlock(createListCollectorPage(), createCtx());
    expect(confirmation).toMatchSnapshot();
  });
});

describe("Edit Block", () => {
  it("should build the Edit block", () => {
    const confirmation = new EditBlock(createListCollectorPage(), createCtx());
    expect(confirmation).toMatchSnapshot();
  });
});

describe("Remove Block", () => {
  it("should build the remove block", () => {
    const confirmation = new RemoveBlock(createListCollectorPage());
    expect(confirmation).toMatchSnapshot();
  });
});

describe("Summary Block", () => {
  it("should build the Summary block", () => {
    const confirmation = new SummaryBlock(createListCollectorPage(), createCtx());
    expect(confirmation).toMatchSnapshot();
  });
});