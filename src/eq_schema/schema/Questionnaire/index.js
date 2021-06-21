const { last } = require("lodash");

const {
  DEFAULT_METADATA,
  DEFAULT_METADATA_NAMES,
} = require("../../../constants/metadata");

const { contentMap } = require("../../../constants/legalBases");

const { Confirmation, Introduction, Summary } = require("../../block-types");

const Section = require("../Section");
const Hub = require("../Hub");
const Questionnaire_Flow = require("../Questionnaire_Flow");

const getPreviewTheme = ({ previewTheme, themes }) =>
  themes && themes.find((theme) => theme && theme.shortName === previewTheme);

class Questionnaire {
  constructor(questionnaireJson) {
    const { surveyId } = questionnaireJson;
    const { eqId, formType, legalBasisCode } = getPreviewTheme(
      questionnaireJson.themeSettings
    );

    this.language = "en";
    this.mime_type = "application/json/ons/eq";
    this.schema_version = "0.0.1";
    this.data_version = "0.0.3";

    this.survey_id = surveyId;
    this.eq_id = eqId;
    this.form_type = formType;
    this.legal_basis = contentMap[legalBasisCode];

    this.title = questionnaireJson.title;

    const ctx = this.createContext(questionnaireJson);

    // this.hub = this.buildHub(questionnaireJson.hub, ctx);
    // this.hub = { enabled: false };

    this.questionnaire_flow = {
          "type": "Linear",
            "options": {
              "summary" : {
                "collapsible": false
          },
      }
    };

    // this.questionnaire_flow = this.buildQuestionnaire_Flow(
    //   questionnaireJson.questionnaire_flow,
    //   ctx
    // );

    this.sections = this.buildSections(questionnaireJson.sections, ctx);
    this.buildIntroduction(questionnaireJson.introduction, ctx);

    this.theme = questionnaireJson.theme;

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

  buildQuestionnaire_Flow(questionnaire_flow) {
    if (questionnaire_flow) {
      return new Questionnaire_Flow(questionnaire_flow);
    }
    return {
      type: "Linear",
      options: {
        summary: {
          collapsible: false,
        },
      },
    };
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
