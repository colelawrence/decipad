const { ...baseConfig } = require('./jest-base.config');

module.exports = {
  ...baseConfig,
  transform: {
    '^.+\\.[jt]sx?$': ['@swc/jest', {}],
    '^.+\\.mjs$': ['babel-jest', {}],
  },
};
