const ListCollectorQuestion = require("./listCollectorQuestion");
const AddBlock = require("./addBlock");
const EditBlock = require("./editBlock");
const RemoveBlock = require("./removeBlock");
const SummaryBlock = require("./summaryBlock");
const DrivingQuestion = require("./drivingQuestion");
const RepeatingBlock = require("./repeatingBlock");

const { getList } = require("../../../utils/functions/listGetters");
const {
  formatPageDescription,
} = require("../../../utils/functions/formatPageDescription");

const authorListCollectorPageTypes = [
  "ListCollectorQualifierPage",
  "ListCollectorAddItemPage",
  "ListCollectorConfirmationPage",
];

const hasRepeatingQuestion = (pages) =>
  pages.some((page) => !authorListCollectorPageTypes.includes(page.pageType));

const generateRepeatingBlocks = (pages, ctx) => {
  const repeatingBlockPages = [];
  pages.forEach((page) => {
    if (!authorListCollectorPageTypes.includes(page.pageType)) {
      const repeatingBlockPage = new RepeatingBlock(page, ctx);
      repeatingBlockPages.push(repeatingBlockPage);
    }
  });

  return repeatingBlockPages;
};

const createListCollectorBlock = (pages, ctx) => {
  const listCollector = {};
  const drivingQuestion = {};

  drivingQuestion.id = formatPageDescription(pages[0].pageDescription);
  drivingQuestion.type = "ListCollectorDrivingQuestion";
  drivingQuestion.for_list = getList(ctx, pages[0].listId).listName;
  drivingQuestion.question = new DrivingQuestion(pages[0], pages, ctx);
  drivingQuestion.routing_rules = DrivingQuestion.routingRules(
    pages[0],
    pages,
    ctx
  );
  drivingQuestion.page_title = pages[0].pageDescription;

  listCollector.id = formatPageDescription(
    pages[pages.length - 1].pageDescription
  );
  listCollector.type = "ListCollector";
  listCollector.page_title = pages[pages.length - 1].pageDescription;
  listCollector.for_list = getList(ctx, pages[1].listId).listName;
  listCollector.question = new ListCollectorQuestion(
    pages[pages.length - 1],
    ctx
  );
  listCollector.add_block = new AddBlock(pages[1], ctx);
  listCollector.repeating_blocks = hasRepeatingQuestion(pages)
    ? generateRepeatingBlocks(pages, ctx)
    : undefined;
  listCollector.edit_block = new EditBlock(pages[1], ctx);
  listCollector.remove_block = new RemoveBlock(pages[1], ctx);
  listCollector.summary = new SummaryBlock(pages[pages.length - 1], ctx);

  return [drivingQuestion, listCollector];
};

module.exports = createListCollectorBlock;
