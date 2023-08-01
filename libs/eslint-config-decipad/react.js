const { overrides } = require('.');

module.exports = {
  plugins: ['unused-imports'],
  extends: [
    './base',
    'eslint-config-react-app', // includes the TypeScript plugin
    'eslint-config-prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',

    'no-console': ['error', { allow: ['error', 'warn', 'info'] }],

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
