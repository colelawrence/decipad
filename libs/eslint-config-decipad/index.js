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
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'eslint:recommended',
    'eslint-config-airbnb-base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
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
    'default-case': 'off',
    'no-nested-ternary': 'off',
    'no-cond-assign': ['error', 'except-parens'],
    'no-continue': 'off',
    'no-case-declarations': 'off',
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
