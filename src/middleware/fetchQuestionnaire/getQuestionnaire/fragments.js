const Questionnaire = {};

const metadata = `
fragment metadataFragment on Metadata {
    id
    key
    type
  }
`;

Questionnaire.fragments = {
  metadata
};

module.exports = Questionnaire;
