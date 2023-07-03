const Block = require("../Block");
const { isEmpty, reject, flatten, uniqWith, isEqual } = require("lodash");
const createListCollectorBlock = require("../../block-types/listCollector/createListCollectorBlock");

const {
  buildAuthorConfirmationQuestion,
} = require("../../builders/confirmationPage/ConfirmationPage");

class Group {
  constructor(section, ctx) {
    this.id = `group${section.id}`;
    this.blocks = this.buildBlocks(section, ctx);

    if (!isEmpty(ctx.routingGotos)) {
      this.filterContext(this.id, ctx);
      const skipConditions = uniqWith(
        this.buildSkipConditions(this.id, ctx),
        isEqual
      );

      if (!isEmpty(skipConditions)) {
        this.skip_conditions = skipConditions;
      }
    }
  }

  filterContext(currentId, ctx) {
    ctx.routingGotos = reject(
      ctx.routingGotos,
      (rule) => rule.group === currentId
    );
  }

  buildSkipConditions(currentId, ctx) {
    return reject(ctx.routingGotos, (goto) => goto.groupId === currentId).map(
      ({ when }) => ({
        when,
      })
    );
  }

  buildBlocks(section, ctx) {
    let listCollectorPages = [];
    return flatten(
      section.pages.reduce((blocks, page) => {
        if (page.pageType === "ListCollectorQualifierPage") {
          listCollectorPages.push(page);
          return blocks;
          // return [new Block(drivingBlock, section.id, ctx), block];
        }
        if (
          listCollectorPages.length &&
          page.pageType !== "ListCollectorConfirmationPage"
        ) {
          listCollectorPages.push(page);
          return blocks;
        }
        if (page.pageType === "ListCollectorConfirmationPage") {
          listCollectorPages.push(page);
          const listCollectorBlock = createListCollectorBlock(
            listCollectorPages,
            ctx
          );
          listCollectorPages = [];
          blocks.push(listCollectorBlock);
        }
        const block = new Block(page, section.id, ctx);
        blocks.push(block);
        if (page.confirmation) {
          blocks.push(
            buildAuthorConfirmationQuestion(page, section.id, page.routing, ctx)
          );
        }

        return blocks;
      }, [])
    );
  }
}

module.exports = Group;
