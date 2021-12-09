const buildContactDetails = (telephoneNumber, emailAddress, emailSubject, includeRURef) => {
 
  const emailBlock = includeRURef ? {
    email_address: emailAddress,
    email_subject: emailSubject,
    email_subject_append: {
      identifier: "ru_ref",
      source: "metadata",
    },
  } :
  {
      email_address: emailAddress,
      email_subject: emailSubject,
  };

  const html = [
    {
      description: {
        text: "If the company details or structure have changed contact us on {telephone_number_link} or email {email_link}",
        placeholders: [
          {
            placeholder: "telephone_number_link",
            transforms: [
              {
                transform: "telephone_number_link",
                arguments: {
                  telephone_number: telephoneNumber,
                },
              },
            ],
          },
          {
            placeholder: "email_link",
            transforms: [
              {
                transform: "email_link",
                arguments: emailBlock,
              },
            ],
          },
        ],
      },
    },
  ];

  return html;
}

module.exports = buildContactDetails;