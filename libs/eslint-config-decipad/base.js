const {
  defaults: { testMatch },
} = require('jest-config');
const testFiles = [...testMatch, '**/*{{t,T}est,{s,S}pec}*.{js,jsx,ts,tsx}'];

module.exports = {
  ignorePatterns: ['**/*'],
  parser: '@typescript-eslint/parser',
  settings: {
    'import/resolver': {
      'eslint-import-resolver-typescript': {
        alwaysTryTypes: true,
      },
    },
  },
  extends: [
    'eslint:recommended',
    'eslint-config-airbnb-base',
    'plugin:jest/recommended',
    'plugin:playwright/jest-playwright',
    'eslint-config-prettier',
    'plugin:prettier/recommended',
  ],
  rules: {
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: [...testFiles, '**/*.config.{js,jsx,ts,tsx}'] },
    ],

    'max-classes-per-file': 'off',
    'lines-between-class-members': 'off',
    'class-methods-use-this': 'off',

    'no-restricted-syntax': 'off',
    'consistent-return': 'off',
    'array-callback-return': 'off',
    'default-case': 'off',
    'no-nested-ternary': 'off',
    'no-cond-assign': ['error', 'except-parens'],
    'no-continue': 'off',
    'no-case-declarations': 'off',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@decipad/fraction',
            message: 'Use @decipad/number instead of @decipad/fraction',
          },
          {
            name: 'fraction.js',
            message: 'Use @decipad/number instead of fraction.js',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: '**/*.js',
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: testFiles,
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
};
