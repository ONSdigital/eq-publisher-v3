const DEFAULT_METADATA = [
  {
    name: "user_id",
    type: "string",
  },
  {
    name: "period_id",
    type: "string",
  },
  {
    name: "ru_name",
    type: "string",
  },
  {
    name: "ru_ref",
    type: "string",
  },
];

const DEFAULT_METADATA_NAMES = DEFAULT_METADATA.map(({ name }) => name);

module.exports = {
  DEFAULT_METADATA,
  DEFAULT_METADATA_NAMES,
};
