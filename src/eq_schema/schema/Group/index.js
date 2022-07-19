const Block = require("../Block");
const { isEmpty, reject, flatten, uniqWith, isEqual } = require("lodash");
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
    return flatten(
      section.pages.map((page) => {
        const block = new Block(page, section.id, ctx);
        if (page.confirmation) {
          return [
            block,
            buildAuthorConfirmationQuestion(
              page,
              section.id,
              page.routing,
              ctx
            ),
          ];
        }
        if (page.pageType === "ListCollectorPage") {
          const drivingBlock = {
            ...page, 
            pageType: "DrivingQuestionPage",
          }
          delete drivingBlock.routing
          delete drivingBlock.skipConditions
          return [
            new Block(
              drivingBlock, 
              section.id, 
              ctx
            ),
            block
          ]
        }
        return block;
      })
    );
  }
}

module.exports = Group;
