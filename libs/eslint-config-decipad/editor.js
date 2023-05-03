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
            name: '@udecode/plate',
            importNames: ['useEditorState'],
            message:
              'useEditorState updates the calling component everytime anything changes anywhere else in the editor.',
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
          {
            name: '@udecode/plate',
            importNames: ['insertNodes'],
            message:
              'Node insertion should be done through @decipad/editor-utils',
          },
          {
            name: '@udecode/plate',
            importNames: ['getAboveNode'],
            message:
              'Should use the safe version getAboveNodeSafe in @decipad/editor-utils',
          },
          {
            name: '@udecode/plate',
            importNames: ['getNodeEntry'],
            message:
              'Should use the safe version getNodeEntrySafe in @decipad/editor-utils',
          },
        ],
      },
    ],
  },
};
