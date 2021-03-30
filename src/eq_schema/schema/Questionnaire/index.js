const { last } = require("lodash");
const legalBases = require("../../../constants/legalBases");
const { SOCIAL } = require("../../../constants/questionnaireTypes");

const {
  DEFAULT_METADATA,
  DEFAULT_METADATA_NAMES,
} = require("../../../constants/metadata");

const SOCIAL_THEME = "social";
const DEFAULT_THEME = "default";
const NI_THEME = "northernireland";

const { Confirmation, Introduction, Summary } = require("../../block-types");

const Section = require("../Section");
const Hub = require("../Hub");

const getPreviewTheme = ({ themes, previewTheme }) =>
  previewTheme &&
  themes &&
  themes.find((theme) => theme && theme.shortName === previewTheme);

class Questionnaire {
  constructor(questionnaireJson) {
    const { id: questionnaireId, introduction } = questionnaireJson;
    const isSocialSurvey = questionnaireJson.type === SOCIAL;
    const previewTheme = getPreviewTheme(questionnaireJson) || {
      shortName:
        (isSocialSurvey && SOCIAL_THEME) ||
        (questionnaireJson.theme === NI_THEME ? NI_THEME : DEFAULT_THEME),
      legalBasis: introduction && introduction.legalBasis,
      eqId: questionnaireId,
      formType: questionnaireId,
    };

    this.eq_id = previewTheme.eqId;
    this.form_type = previewTheme.formType;
    this.language = "en";
    this.mime_type = "application/json/ons/eq";
    this.schema_version = "0.0.1";
    this.data_version = "0.0.3";
    this.survey_id =
      questionnaireJson.surveyId ||
      this.buildSurveyId(
        questionnaireJson.publishDetails,
        questionnaireJson.title
      );
    this.title = questionnaireJson.title;

    const ctx = this.createContext(questionnaireJson);

    this.hub = this.buildHub(questionnaireJson.hub, ctx);
    this.sections = this.buildSections(questionnaireJson.sections, ctx);
    this.buildIntroduction(questionnaireJson.introduction, ctx);

    this.theme = previewTheme.shortName;

    this.legal_basis = isSocialSurvey
      ? undefined
      : legalBases[previewTheme.legalBasis];

    this.navigation = {
      visible: questionnaireJson.navigation,
    };
    this.metadata = this.buildMetadata(questionnaireJson.metadata);

    this.view_submitted_response = {
      enabled: true,
      duration: 900,
    };

    this.buildSummaryOrConfirmation(questionnaireJson.summary);
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
      questionnaireJson,
    };
  }

  buildHub(hub) {
    if (hub) {
      return new Hub(hub);
    }
    return { enabled: false };
  }

  buildSections(sections, ctx) {
    return sections.map((section) => new Section(section, ctx));
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
        type: type === "Date" ? "date" : "string",
      }));

    return [...DEFAULT_METADATA, ...userMetadata];
  }

  buildIntroduction(introduction, ctx) {
    if (!introduction) {
      return;
    }
    const groupToAddTo = this.sections[0].groups[0];
    groupToAddTo.blocks = [
      new Introduction(introduction, ctx),
      ...groupToAddTo.blocks,
    ];
  }
}

module.exports = Questionnaire;
