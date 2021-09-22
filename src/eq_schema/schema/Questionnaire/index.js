const {
  DEFAULT_METADATA,
  DEFAULT_METADATA_NAMES,
} = require("../../../constants/metadata");

const { contentMap } = require("../../../constants/legalBases");

const { Introduction } = require("../../block-types");

const Section = require("../Section");
const QuestionnaireFlow = require("../QuestionnaireFlow");

const getPreviewTheme = ({ previewTheme, themes }) =>
  themes && themes.find((theme) => theme && theme.shortName === previewTheme);

class Questionnaire {
  constructor(questionnaireJson) {
    const { surveyId } = questionnaireJson;
    const { formType, legalBasisCode } = getPreviewTheme(
      questionnaireJson.themeSettings
    );

    this.language = "en";
    this.mime_type = "application/json/ons/eq";
    this.schema_version = "0.0.1";
    this.data_version = "0.0.1";

    this.survey_id = surveyId || "zzz";
    this.form_type = formType || "9999";
    this.legal_basis = contentMap[legalBasisCode];

    this.title = questionnaireJson.title;

    const ctx = this.createContext(questionnaireJson);

    this.questionnaire_flow = this.buildQuestionnaireFlow(questionnaireJson)

    this.sections = this.buildSections(questionnaireJson.sections, ctx);
    
    this.buildIntroduction(questionnaireJson.introduction, ctx);

    this.theme = questionnaireJson.theme;

    this.navigation = {
      visible: questionnaireJson.navigation,
    };
    this.metadata = this.buildMetadata(questionnaireJson.metadata);
  }

  createContext(questionnaireJson) {
    return {
      routingGotos: [],
      questionnaireJson,
    };
  }

  buildQuestionnaireFlow(questionnaireJson) {
    return new QuestionnaireFlow(questionnaireJson);
  }

  buildIntroduction(introduction, ctx) {
    if (!introduction) {
      return;
    }
  
    const newSections = [{
      id: `section${introduction.id}`,
      title: "Introduction",
      show_on_hub: false,
      groups: [{
        id: `group${introduction.id}`,
        title: "Introduction",
        blocks: [new Introduction(introduction, ctx)]
      }],
    }, ...this.sections];
    
    this.sections = newSections;
  }

  buildSections(sections, ctx) {
    return sections.map((section) => new Section(section, ctx));
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


}

module.exports = Questionnaire;
