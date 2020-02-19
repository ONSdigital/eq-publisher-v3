# eq-publisher-v3

A new version of `eq-publisher` for translating questionnaires built in Author into Runner V3 format. When finished, this project will replace `eq-publisher` within the `eq-author-app` repository.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. There are no deployment steps as this project is in development.

### Prerequisites

- [NodeJS](https://nodejs.org/en/)
- [Yarn](https://classic.yarnpkg.com/en/)
- [Node Version Manager](https://github.com/nvm-sh/nvm)

`eq-author-app` is currently supports NodeJS version 10 and prior, therefore this application does the same. To swap to version 10, run `nvm install 10 && nvm use 10` in the terminal, beneath the `eq-publisher-v3` directory.

### Installing

1. Clone the repository
2. Run `yarn` to install the dependencies
3. Run `yarn start` to boot up the application

**Development**

If validating a schema during development envrionment variable `EQ_SCHEMA_VALIDATOR_URL` is needed.

Run `yarn develop` to start the application with Nodemon. Nodemon automatically refreshes the application when source files change, making development easy.

## Running the tests

Run `yarn test` to kick-start the unit tests. Our unit tests are written in [Jest](https://jestjs.io/), which allows a [variety of flags](https://jestjs.io/docs/en/cli#options) to be passed along with the start command; you may use these at your leisure.

Run `yarn test:watch` to run Jest on file changes.

We do not currently have end-to-end tests.

### Coding style tests

Run `yarn lint` to examine the code for any common styling issues. We do this to ensure we write quality and consistent code.

## Deployment

There are no deployment steps as this application is currently in development.

## API Reference

| Method | Endpoint                       | Description                                      |
| ------ | ------------------------------ | ------------------------------------------------ |
| POST   | [`/publish`](#publish)         | Convert author JSON                              |
| POST   | [`/publish/validate`](#submit) | Validates converted JSON with a schema validator |

### Publish

Converts author JSON to V3 and returns it

- **URL**

  `/publish`

- **Method:**

  `POST`

- **Body Params**

  ```
  { author questionnaire }
  ```

- **Success Response:**

  **Code:** 200 <br />
  **Example:** Runner JSON; examples: https://github.com/ONSdigital/eq-questionnaire-runner/blob/master/test_schemas/en/ecommerce.json

- **Fail Responses:**

  **Code:** 400 <br/>

  ### Validate Publish

Validates converted questionnaire against schema

- **URL**

  `/publish/validate`

- **Method:**

  `POST`

- **Body Params**

  ```
  { author questionnaire }
  ```

- **Success Response:**

  **Code:** 200 <br />
  **Example:** Runner JSON; examples: https://github.com/ONSdigital/eq-questionnaire-runner/blob/master/test_schemas/en/ecommerce.json

- **Fail Responses:**

  **Code:** 400 <br/>
  **Example:**

  ```
  {
    "valid": false,
    "errors": {
        "message": "Additional properties are not allowed ('hub' was unexpected)",
        "path": "deque([])",
        "predicted_cause": "Additional properties are not allowed ('hub' was unexpected)"
    }
  }
  ```
