const { last } = require("lodash");

const { SOCIAL } = require("../../constants/questionnaireTypes");
const {
  types: { VOLUNTARY },
  contentMap
} = require("../../constants/legalBases");

const { Confirmation, Introduction, Summary } = require("../block-types");

const Section = require("./Section");
const Hub = require("./Hub");

const DEFAULT_METADATA = [
  {
    name: "user_id",
    type: "string"
  },
  {
    name: "period_id",
    type: "string"
  },
  {
    name: "ru_name",
    type: "string"
  }
];

const SOCIAL_THEME = "social";
const DEFAULT_THEME = "default";
const NI_THEME = "northernireland";

const DEFAULT_METADATA_NAMES = DEFAULT_METADATA.map(({ name }) => name);

class Questionnaire {
  constructor(questionnaireJson) {
    const questionnaireId = questionnaireJson.id;
    this.eq_id = questionnaireId;
    this.form_type = questionnaireId;
    this.mime_type = "application/json/ons/eq";
    this.schema_version = "0.0.1";
    this.data_version = "0.0.3";
    this.survey_id =
      questionnaireJson.surveyId ||
      questionnaireJson.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    this.title = questionnaireJson.title;

    const ctx = this.createContext(questionnaireJson);
    // hub will be called here
    this.hub = this.buildHub(questionnaireJson.hub, ctx);
    this.sections = this.buildSections(questionnaireJson.sections, ctx);
    this.buildIntroduction(questionnaireJson.introduction, ctx);

    this.theme =
      questionnaireJson.type === SOCIAL ? SOCIAL_THEME : DEFAULT_THEME;

    this.theme = questionnaireJson.theme === NI_THEME ? NI_THEME : this.theme;

    this.legal_basis = this.buildLegalBasis(questionnaireJson.introduction);
    this.navigation = {
      visible: questionnaireJson.navigation
    };
    this.metadata = this.buildMetadata(questionnaireJson.metadata);

    this.view_submitted_response = {
      enabled: true,
      duration: 900
    };

    this.buildSummaryOrConfirmation(questionnaireJson.summary);
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

  buildSummaryOrConfirmation(summary) {
    const finalPage = summary ? new Summary() : new Confirmation();
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

Questionnaire.DEFAULT_METADATA = DEFAULT_METADATA;
module.exports = Questionnaire;
