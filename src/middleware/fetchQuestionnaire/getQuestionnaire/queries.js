const Questionnaire = require("./fragments");
exports.getQuestionnaire = `
  query GetQuestionnaire($input: QueryInput!) {
    questionnaire(input: $input) {
      id
      title
      description
      type
      theme
      introduction {
        id
        title
        description
        legalBasis
        secondaryTitle
        secondaryDescription
        collapsibles {
          id
          title
          description
        }
        tertiaryTitle
        tertiaryDescription
      }
      navigation
      surveyId
      summary
      metadata {
        ...metadataFragment
      }
      sections {
        id
        title
        introductionTitle
        introductionContent
        pages {
          id
          title
          pageType
          ... on CalculatedSummaryPage {
            totalTitle
            summaryAnswers {
              id
            }
            availableSummaryAnswers {
              id
            }
          }
          ... on QuestionPage {
            description
            descriptionEnabled
            guidance
            guidanceEnabled
            definitionLabel
            definitionContent
            definitionEnabled
            additionalInfoLabel
            additionalInfoContent
            additionalInfoEnabled
            confirmation {
              id
              title
              qCode
              positive {
                label
                description
              }
              negative {
                label
                description
              }
            }
            answers {
              ...answerFragment
              ... on MultipleChoiceAnswer {
                options {
                  ...optionFragment
                }
                mutuallyExclusiveOption {
                  ...optionFragment
                }
              }
            }
            routing {
              rules {
                expressionGroup {
                  operator
                  expressions {
                    ... on BinaryExpression2 {
                      left {
                        ... on BasicAnswer {
                          id
                          type
                          label
                        }
                        ... on MultipleChoiceAnswer {
                          id
                          type
                          options {
                            id
                          }
                        }
                      }
                      condition
                      right {
                        ... on CustomValue2 {
                          number
                        }
                        ... on SelectedOptions2 {
                          options {
                            id
                            label
                          }
                        }
                      }
                    }
                  }
                }
                destination {
                  ...destination2Fragment
                }
              }
              else {
                ...destination2Fragment
              }
            }
            totalValidation {
              id
              enabled
              entityType
              custom
              previousAnswer {
                id
              }
              condition
            }
          }
        }
      }
    }
  }
  ${Questionnaire.fragments.metadata}
  ${Questionnaire.fragments.option}
  ${Questionnaire.fragments.destinationTwo}
  ${Questionnaire.fragments.maxDurationValidationRule}
  ${Questionnaire.fragments.minDurationValidationRule}
  ${Questionnaire.fragments.latestDateValidationRule}
  ${Questionnaire.fragments.earliestDateValidationRule}
  ${Questionnaire.fragments.maxValueValidationRule}
  ${Questionnaire.fragments.minValueValidationRule}
  ${Questionnaire.fragments.basicAnswer}
  ${Questionnaire.fragments.answerFragment}
`;
