const plate = require('@udecode/plate');

module.exports = {
  extends: ['../../libs/eslint-config-decipad/react'],
  ignorePatterns: ['!**/*'],
  rules: {
    'no-console': ['error', { allow: ['error'] }],

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
        ],
      },
    ],
  },
};
