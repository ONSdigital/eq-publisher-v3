const { contentMap } = require("../../../constants/legalBases");

const { buildContents, formatListNames } = require("../../../utils/builders");

const createAnswerCodes = require("../../../utils/createAnswerCodes");
const buildSupplementaryData = require("../../../utils/buildSupplementaryData");

const { Introduction } = require("../../block-types");

const Section = require("../Section");
const PostSubmission = require("../PostSubmission");
const Submission = require("../Submission");
const QuestionnaireFlow = require("../QuestionnaireFlow");

class Questionnaire {
  constructor(questionnaireJson) {
    formatListNames(questionnaireJson);
    const { surveyId, formType, legalBasis, theme } = questionnaireJson;

    this.language = "en";
    this.mime_type = "application/json/ons/eq";
    this.schema_version = "0.0.1";
    this.data_version =
      questionnaireJson.dataVersion === "3" ? "0.0.3" : "0.0.1";
    this.preview_questions =
      questionnaireJson.introduction &&
      questionnaireJson.introduction.previewQuestions;

    this.survey_id = surveyId || "zzz";
    this.form_type = formType || "9999";

    if (contentMap[legalBasis]) {
      this.legal_basis = contentMap[legalBasis];
    }

    if (questionnaireJson.dataVersion === "3") {
      this.answer_codes = createAnswerCodes(questionnaireJson);
    }

    const ctx = this.createContext(questionnaireJson);

    this.title = buildContents(questionnaireJson.title, ctx);

    this.questionnaire_flow = this.buildQuestionnaireFlow(questionnaireJson);

    this.sections = this.buildSections(questionnaireJson.sections, ctx);

    if (questionnaireJson.hub) {
      this.buildIntroduction(questionnaireJson.introduction, ctx);
    } else {
      this.buildIntroductionInsideFirstSection(
        questionnaireJson.introduction,
        ctx
      );
    }

    this.theme = theme;

    this.navigation = {
      visible: questionnaireJson.navigation,
    };
    this.metadata = this.buildMetadata(questionnaireJson.metadata);

    this.supplementary_data = buildSupplementaryData(
      questionnaireJson.supplementaryData
    );

    this.post_submission = this.buildPostSubmission(
      questionnaireJson.submission,
      ctx
    );

    this.submission = this.buildSubmission(questionnaireJson.submission);
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

  buildIntroductionInsideFirstSection(introduction, ctx) {
    if (!introduction) {
      return;
    }

    const introBlock = {
      id: `group${introduction.id}`,
      title: "Introduction",
      blocks: [new Introduction(introduction, ctx)],
    };
    this.sections[0].groups.unshift(introBlock);
  }

  buildSections(sections, ctx) {
    return sections.map((section) => new Section(section, ctx));
  }

  buildMetadata(metadata) {
    const userMetadata = metadata
      .filter(({ key }) => !["sds_dataset_id"].includes(key))
      .map(({ key, type }) => ({
        name: key,
        type: type === "Date" ? "date" : "string",
        optional: type === "Text_Optional" || undefined,
      }));

    return [...userMetadata];
  }

  buildSubmission(postSubmission) {
    return new Submission(postSubmission);
  }

  buildPostSubmission(postSubmission, ctx) {
    return new PostSubmission(postSubmission, ctx);
  }
}

module.exports = Questionnaire;
