const { last } = require("lodash");

const {
  DEFAULT_METADATA,
  DEFAULT_METADATA_NAMES
} = require("../../../constants/metadata");

const {
  types: { VOLUNTARY },
  contentMap
} = require("../../../constants/legalBases");

const { Confirmation, Introduction, Summary } = require("../../block-types");

const Section = require("../Section");
const Hub = require("../Hub");

class Questionnaire {
  constructor(questionnaireJson) {
    const questionnaireId = questionnaireJson.id;
    this.eq_id = questionnaireId;
    this.language = "en";
    this.form_type = questionnaireId;
    this.language = "en";
    this.mime_type = "application/json/ons/eq";
    this.schema_version = "0.0.1";
    this.data_version = "0.0.3";
    this.survey_id = this.buildSurveyId(
      questionnaireJson.publishDetails,
      questionnaireJson.title
    );
    this.title = questionnaireJson.title;

    const ctx = this.createContext(questionnaireJson);

    this.hub = this.buildHub(questionnaireJson.hub, ctx);
    this.sections = this.buildSections(questionnaireJson.sections, ctx);
    this.buildIntroduction(questionnaireJson.introduction, ctx);

    this.theme = questionnaireJson.theme;

    this.legal_basis = this.buildLegalBasis(questionnaireJson.introduction);
    this.navigation = {
      visible: questionnaireJson.navigation
    };
    this.metadata = this.buildMetadata(questionnaireJson.metadata);

    this.view_submitted_response = {
      enabled: true,
      duration: 900
    };

    this.buildSummaryOrConfirmation(questionnaireJson.summary, questionnaireJson.collapsibleSummary);
  }

  buildSurveyId(publishDetails, title) {
    if (publishDetails) {
      return publishDetails[0].surveyId;
    }

    return title.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  createContext(questionnaireJson) {
    return {
      routingGotos: [],
      questionnaireJson
    };
  }

  buildHub(hub) {
    if (hub) {
      return new Hub(hub);
    }
    return { enabled: false };
  }

  buildSections(sections, ctx) {
    return sections.map(section => new Section(section, ctx));
  }

  buildSummaryOrConfirmation(summary, collapsible) {
    const finalPage = summary ? new Summary({collapsible}) : new Confirmation();
    last(this.sections).groups.push(finalPage);
  }

  buildMetadata(metadata) {
    const userMetadata = metadata
      .filter(({ key }) => !DEFAULT_METADATA_NAMES.includes(key))
      .map(({ key, type }) => ({
        name: key,
        type: type === "Date" ? "date" : "string"
      }));

    return [...DEFAULT_METADATA, ...userMetadata];
  }

  buildLegalBasis(introduction) {
    if (!introduction || introduction.legalBasis === VOLUNTARY) {
      return undefined;
    }
    return contentMap[introduction.legalBasis];
  }

  buildIntroduction(introduction, ctx) {
    if (!introduction) {
      return;
    }
    const groupToAddTo = this.sections[0].groups[0];
    groupToAddTo.blocks = [
      new Introduction(introduction, ctx),
      ...groupToAddTo.blocks
    ];
  }
}

module.exports = Questionnaire;
