const {
  defaults: { testMatch },
  // eslint-disable-next-line import/no-extraneous-dependencies
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
    'require-await': 'off',
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
    'import/order': 'off',
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
          {
            name: 'fast-deep-equal',
            message: 'Use {deepequal} from @decipad/utils instead of dequal',
          },
          {
            name: 'immer',
            message: 'Use {produce} from @decipad/utils instead of immer',
          },
          {
            name: 'lodash',
            message:
              'Use @decipad/utils or specific lodash functions like lodash.maxby',
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
