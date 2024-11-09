const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

const configPath = path.join(
  process.cwd(),
  "config",
  `rainbow.${process.env.NODE_ENV}.yaml`
);

const config = yaml.load(fs.readFileSync(configPath));

module.exports = config;
