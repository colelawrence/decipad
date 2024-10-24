const playwrightBase = require('eslint-plugin-playwright');
const { join } = require('path');

const { rules, ...playWrightConfig } =
  playwrightBase.configs['playwright-test'];

module.exports = {
  ...playWrightConfig,
  extends: ['../../libs/eslint-config-decipad'],
  ignorePatterns: ['!**/*', '.eslintrc.js'],
  parserOptions: {
    project: join(__dirname, 'tsconfig.json'),
  },
  rules: {
    ...rules,
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',

    'no-await-in-loop': 'off',
    'playwright/expect-expect': 'off',
  },
};
