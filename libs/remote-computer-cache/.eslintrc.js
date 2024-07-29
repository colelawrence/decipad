const { join } = require('path');
const { rules, rest } = require('../eslint-config-decipad');

module.exports = {
  ...rest,
  extends: ['../../libs/eslint-config-decipad'],
  ignorePatterns: ['!**/*'],
  parserOptions: {
    project: join(__dirname, 'tsconfig.json'),
  },
  rules: {
    ...rules,
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
  },
};
