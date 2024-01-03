const { ...baseConfig } = require('./jest-base.config');

const swcConfig = {
  sourceMaps: 'inline',
};

module.exports = {
  ...baseConfig,
  transform: {
    '^.+\\.[jt]sx?$': ['@swc/jest', swcConfig],
    '^.+\\.mjs$': ['babel-jest', swcConfig],
  },
};
