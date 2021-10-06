const { overrides } = require('.');

module.exports = {
  extends: ['.', 'eslint-config-react-app', 'eslint-config-prettier'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',

    // testing-library's waitFor is sometimes used in beforeEach and requires an expect inside
    'jest/no-standalone-expect': 'off',

    // false positives from testing-lib matchers
    'playwright/missing-playwright-await': 'off',
    'array-callback-return': 'off',
  },
  overrides: [
    ...overrides,
    {
      files: ['**/*.stories.tsx'],
      rules: { 'no-script-url': 'off' },
    },
  ],
};
