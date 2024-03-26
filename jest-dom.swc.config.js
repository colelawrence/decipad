const { transform, ...baseConfig } = require('./jest-dom.config');

const jsc = {
  transform: {
    react: {
      runtime: 'automatic',
    },
  },
  experimental: {
    plugins: [['swc-plugin-import-meta-env', {}]],
  },
};

module.exports = {
  ...baseConfig,

  transform: {
    ...transform,
    '^.+\\.[jt]sx?$': ['@swc/jest', { jsc }],
    '^.+\\.mjs$': ['babel-jest', { jsc }],
  },
};
