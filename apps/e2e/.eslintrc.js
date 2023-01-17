const playwrightBase = require('eslint-plugin-playwright');

const { rules, ...playWrightConfig } =
  playwrightBase.configs['playwright-test'];

module.exports = {
  ...playWrightConfig,
  extends: ['../../libs/eslint-config-decipad'],
  ignorePatterns: ['!**/*'],
  rules: {
    ...rules,
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',

    'no-await-in-loop': 'off',
  },
};
