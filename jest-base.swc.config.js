const { ...baseConfig } = require('./jest-base.config');

const swcConfig = {
  sourceMaps: 'inline',
  jsc: {
    experimental: {
      plugins: [['swc-plugin-import-meta-env', {}]],
    },
  },
};

module.exports = {
  ...baseConfig,
  transform: {
    '^.+\\.[jt]sx?$': ['@swc/jest', swcConfig],
    '^.+\\.mjs$': ['babel-jest', swcConfig],
  },
};
