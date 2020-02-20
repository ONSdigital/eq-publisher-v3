class Confirmation {
  constructor() {
    this.id = "confirmation-group";
    this.title = "confirmation";
    this.blocks = [
      {
        type: "Confirmation",
        id: "confirmation",
        content: {
          title: "Submission",
          contents: [{
            title: "You are now ready to submit this survey",
            list: [
              "You will not be able to access or change your answers on submitting the questionnaire",
              "If you wish to review your answers please select the relevant completed sections"
            ],
          }]
        },
      }
    ];
  }
}

module.exports = Confirmation;
