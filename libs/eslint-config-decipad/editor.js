const plate = require('@udecode/plate');

module.exports = {
  extends: ['../../libs/eslint-config-decipad/react'],
  ignorePatterns: ['!**/*'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@udecode/plate',
            importNames: Object.keys(plate).filter((importName) =>
              /^(ELEMENT|MARK)_/.test(importName)
            ),
            message: 'Use editor element/mark kinds definition',
          },
          {
            name: '@decipad/language',
            message: 'Import language helpers from @decipad/computer',
          },
        ],
      },
    ],
  },
};
