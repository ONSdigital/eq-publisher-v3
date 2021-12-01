const { flatMap, get, findIndex, isNil } = require("lodash");

const getAbsoluteDestination = (destination, ctx) => {
  if (destination.pageId) {
    return { block: `block${destination.pageId}` };
  }

  // Get first folder in the section when routing to sections
  // TODO: folder-specific routing code
  const targetSection = ctx.questionnaireJson.sections.find(
    ({ id }) => id === destination.sectionId
  );

  return { group: `group${targetSection.id}` };
};

const getNextPageDestination = (pageId, ctx) => {
  const pages = flatMap(ctx.questionnaireJson.sections, (section) =>
    flatMap(section.folders, (folder) =>
      flatMap(folder.pages, (page) => ({
        id: page.id,
        sectionId: section.id,
        folderId: folder.id,
        folderEnabled: folder.enabled,
      }))
    )
  );
  const confirmationRegex = /confirmation-page-for-(.+)/;

  if (confirmationRegex.test(pageId)) {
    pageId = pageId.match(confirmationRegex)[1];
  }
  const currentPageIndex = findIndex(pages, { id: pageId });
  const currentPage = pages[currentPageIndex];
  const nextPage = pages[currentPageIndex + 1];

  if (isNil(nextPage)) {
    return {
      group: get(ctx, "questionnaireJson.summary")
        ? "summary-group"
        : "confirmation-group",
    };
  } else if (currentPage.sectionId !== nextPage.sectionId) {
    return { group: `group${nextPage.sectionId}` };
  } else {
    return { block: `block${nextPage.id}` };
  }
};

const getLogicalDestination = (pageId, { logical }, ctx) => {
  if (logical === "EndOfQuestionnaire") {
    return {
      group: get(ctx.questionnaireJson, "summary")
        ? "summary-group"
        : "confirmation-group",
    };
  }

  if (logical === "NextPage") {
    return getNextPageDestination(pageId, ctx);
  } 

  if (logical === "EndOfCurrentSection") {
    return { section: "End"}
  }
  
  throw new Error(`${logical} is not a valid destination type`);

};

const translateRoutingDestination = (destination, pageId, ctx) => {
  if (destination.logical) {
    return getLogicalDestination(pageId, destination, ctx);
  } else if (destination.pageId || destination.sectionId) {
    return getAbsoluteDestination(destination, ctx);
  } else {
    throw new Error(`${destination} is not a valid destination object`);
  }
};

module.exports = translateRoutingDestination;
