const { overrides } = require('./base');

module.exports = {
  extends: [
    './base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint/eslint-plugin', 'unused-imports'],
  overrides,
};
