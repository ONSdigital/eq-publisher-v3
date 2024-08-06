const questionnaireJson = {
  id: "1",
  title: "Basic Questionnaire JSON",
  summary: false,
  metadata: [
    {
      id: "metadata-1",
      key: "ru_name",
      alias: "Ru Name",
      type: "Text",
      textValue: "ESSENTIAL ENTERPRISE LTD.",
    },
  ],
  sections: [
    {
      id: "1",
      title: "<p>Section 1</p>",
      folders: [
        {
          id: "folder-1",
          enabled: false,
          pages: [
            {
              id: "1",
              title: "<p>Page 1</p>",
              pageType: "QuestionPage",
              routingRuleSet: null,
              confirmation: null,
              answers: [
                {
                  id: "1",
                  type: "Currency",
                  label: "Answer 1",
                },
              ],
            },
            {
              id: "2",
              title: "<p>Page 2</p>",
              pageType: "QuestionPage",
              routingRuleSet: null,
              confirmation: null,
              answers: [
                {
                  id: "2",
                  type: "Number",
                  label: "Answer 2",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "2",
      title: "<p>Section 2</p>",
      folders: [
        {
          id: "folder-2",
          enabled: false,
          pages: [
            {
              id: "3",
              title: "<p>Page 3</p>",
              pageType: "QuestionPage",
              routingRuleSet: null,
              confirmation: null,
              answers: [
                {
                  id: "3",
                  type: "Number",
                  label: "Answer 3",
                },
                {
                  id: "4",
                  type: "Checkbox",
                  options: [
                    {
                      id: "123",
                      label: "red",
                    },
                    {
                      id: "456",
                      label: "white",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "3",
      title: "<p>Section 3</p>",
      folders: [
        {
          id: "folder-3",
          enabled: false,
          pages: [
            {
              id: "4",
              title: "<p>Page 4</p>",
              pageType: "QuestionPage",
              routingRuleSet: null,
              confirmation: null,
              answers: [
                {
                  id: "5",
                  type: "Number",
                  label: "Answer 5",
                },
                {
                  id: "6",
                  type: "MutuallyExclusive",
                  options: [
                    {
                      id: "exclusive-option-1",
                      label: "Not known",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const questionnaireJsonWithSummary = {
  ...questionnaireJson,
  summary: true,
};

module.exports = { questionnaireJson, questionnaireJsonWithSummary };
