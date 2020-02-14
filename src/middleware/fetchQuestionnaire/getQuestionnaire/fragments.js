const Questionnaire = {};

const metadata = `
fragment metadataFragment on Metadata {
    id
    key
    type
  }
`;
const option = `
fragment optionFragment on Option {
    id
    label
    description
    value
    qCode
    additionalAnswer {
      ...answerFragment
    }
  }
`;
const destinationTwo = `
fragment destination2Fragment on Destination2 {
    section {
      id
    }
    page {
      id
    }
    logical
  }  
`;

const maxDurationValidationRule = `
fragment MaxDurationValidationRule on MaxDurationValidationRule {
    id
    enabled
    duration {
      value
      unit
    }
  }
`;

const minDurationValidationRule = `
fragment MinDurationValidationRule on MinDurationValidationRule {
  id
  enabled
  duration {
    value
    unit
  }
}
`;

const latestDateValidationRule = `
fragment LatestDateValidationRule on LatestDateValidationRule {
  id
  enabled
  entityType
  custom
  offset {
    value
    unit
  }
  relativePosition
  previousAnswer {
    id
  }
  metadata {
    key
  }
}
`;

const earliestDateValidationRule = `
fragment EarliestDateValidationRule on EarliestDateValidationRule {
  id
  enabled
  entityType
  custom
  offset {
    value
    unit
  }
  relativePosition
  previousAnswer {
    id
  }
  metadata {
    key
  }
}
`;

const maxValueValidationRule = `
fragment MaxValueValidationRule on MaxValueValidationRule {
  id
  enabled
  custom
  inclusive
  entityType
  previousAnswer {
    id
  }
}
`;

const minValueValidationRule = `
fragment MinValueValidationRule on MinValueValidationRule {
  id
  enabled
  custom
  inclusive
  entityType
  previousAnswer {
    id
  }
}
`;

const basicAnswer = `
fragment BasicAnswer on BasicAnswer {
  secondaryQCode
  validation {
    ... on NumberValidation {
      minValue {
        ...MinValueValidationRule
      }
      maxValue {
        ...MaxValueValidationRule
      }
    }
    ... on DateValidation {
      earliestDate {
        ...EarliestDateValidationRule
      }
      latestDate {
        ...LatestDateValidationRule
      }
    }
    ... on DateRangeValidation {
      earliestDate {
        ...EarliestDateValidationRule
      }
      latestDate {
        ...LatestDateValidationRule
      }
      minDuration {
        ...MinDurationValidationRule
      }
      maxDuration {
        ...MaxDurationValidationRule
      }
    }
  }
}
`;

const answerFragment = `
fragment answerFragment on Answer {
  id
  type
  label
  secondaryLabel
  description
  guidance
  properties
  qCode
  ...BasicAnswer
}
`;

Questionnaire.fragments = {
  metadata,
  option,
  destinationTwo,
  maxDurationValidationRule,
  minDurationValidationRule,
  latestDateValidationRule,
  earliestDateValidationRule,
  maxValueValidationRule,
  minValueValidationRule,
  basicAnswer,
  answerFragment
};

module.exports = Questionnaire;
