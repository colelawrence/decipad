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
    tailwindcss: {
      callees: ['cn', 'cva'],
      config: '../../tailwind.config.js',
    },
  },
  extends: [
    'eslint:recommended',
    'eslint-config-airbnb-base',
    'plugin:jest/recommended',
    'plugin:playwright/jest-playwright',
    'plugin:tailwindcss/recommended',
    'eslint-config-prettier',
    'plugin:prettier/recommended',
  ],
  rules: {
    'require-await': 'off',
    'import/prefer-default-export': 'off',
    'no-plusplus': 'off',
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

    'tailwindcss/classnames-order': 'off',
    'tailwindcss/no-custom-classname': 'off',

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
    'no-void': 'off',

    '@typescript-eslint/no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
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
            name: '@decipad/computer',
            message:
              'Use @decipad/remote-computer instead of @decipad/computer',
          },
          {
            name: '@decipad/language',
            message:
              'Use @decipad/remote-computer instead of @decipad/language',
          },
          {
            name: '@decipad/language-types',
            message:
              'Use @decipad/remote-computer instead of @decipad/language-types',
          },
          {
            name: '@decipad/language-builtins',
            message:
              'Use @decipad/remote-computer instead of @decipad/language-builtins',
          },
          {
            name: '@decipad/language-utils',
            message:
              'Use @decipad/remote-computer instead of @decipad/language-utils',
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
          {
            name: 'react-use-intercom',
            message: 'Use useIntercom from @decipad/react-utils instead',
          },
        ],
      },
    ],
    complexity: ['error', { max: 20 }],
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
