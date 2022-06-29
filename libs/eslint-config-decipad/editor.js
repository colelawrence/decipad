const plate = require('@udecode/plate');

module.exports = {
  extends: ['../../libs/eslint-config-decipad/react'],
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
          {
            name: 'slate-react',
            importNames: ['useReadOnly'],
            message:
              'We do not usually set the entire editor to readOnly. Import useIsEditorReadOnly instead.',
          },
        ],
      },
    ],
  },
};
