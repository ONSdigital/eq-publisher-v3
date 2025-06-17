const getSectionByPageId = (ctx, pageId) => {
  let result;
  if (ctx && ctx.questionnaireJson && ctx.questionnaireJson.sections) {
    ctx.questionnaireJson.sections.forEach((section) => {
      section.folders.forEach((folder) => {
        folder.pages.forEach((page) => {
          if (page.id === pageId) {
            result = section;
          }
        });
      });
    });
  }
  return result;
};

const getSectionByAnswerId = (ctx, answerId) => {
  let result;
  if (ctx && ctx.questionnaireJson && ctx.questionnaireJson.sections) {
    ctx.questionnaireJson.sections.forEach((section) => {
      section.folders.forEach((folder) => {
        folder.pages.forEach((page) => {
          if (page.answers) {
            page.answers.forEach((answer) => {
              if (answer.id === answerId) {
                result = section;
              }
            });
          }
        });
      });
    });
  }
  return result;
};


module.exports = { getSectionByPageId, getSectionByAnswerId };
