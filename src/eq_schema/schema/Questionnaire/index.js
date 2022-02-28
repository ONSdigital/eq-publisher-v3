const {
  DEFAULT_METADATA,
  DEFAULT_METADATA_NAMES,
} = require("../../../constants/metadata");

const { contentMap } = require("../../../constants/legalBases");

const { buildContents } = require("../../../utils/builders");

const validThemes = require("../../../constants/validThemes");

const { Introduction } = require("../../block-types");

const Section = require("../Section");
const PostSubmission = require("../PostSubmission");
const QuestionnaireFlow = require("../QuestionnaireFlow");

const getPreviewTheme = ({ previewTheme, themes }) =>
  themes && themes.find((theme) => theme && theme.shortName === previewTheme);

const getTheme = (previewTheme) => {
  if (validThemes.includes(previewTheme)) {
    return previewTheme;
  } else {
    return "default";
  }
};

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
    if (contentMap[legalBasisCode]) {
      this.legal_basis = contentMap[legalBasisCode];
    }

    const ctx = this.createContext(questionnaireJson);

    this.title = buildContents(questionnaireJson.title, ctx);

    this.questionnaire_flow = this.buildQuestionnaireFlow(questionnaireJson);

    this.sections = this.buildSections(questionnaireJson.sections, ctx);

    this.buildIntroduction(questionnaireJson.introduction, ctx);

    this.theme = getTheme(questionnaireJson.themeSettings.previewTheme);

    this.navigation = {
      visible: questionnaireJson.navigation,
    };
    this.metadata = this.buildMetadata(questionnaireJson.metadata);

    this.post_submission = this.buildPostSubmission(
      questionnaireJson.submission,
      ctx
    );
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

    const newSections = [
      {
        id: `section${introduction.id}`,
        title: "Introduction",
        show_on_hub: introduction.showOnHub,
        groups: [
          {
            id: `group${introduction.id}`,
            title: "Introduction",
            blocks: [new Introduction(introduction, ctx)],
          },
        ],
      },
      ...this.sections,
    ];

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
        optional: type === "Text_Optional" || undefined,
      }));

    return [...DEFAULT_METADATA, ...userMetadata];
  }

  buildPostSubmission(postSubmission, ctx) {
    return new PostSubmission(postSubmission, ctx);
  }
}

module.exports = Questionnaire;
