const plate = require('@udecode/plate-common');

module.exports = {
  plugins: ['unused-imports'],
  extends: ['../../libs/eslint-config-decipad/react'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@udecode/plate-common',
            importNames: Object.keys(plate).filter((importName) =>
              /^(ELEMENT|MARK)_/.test(importName)
            ),
            message: 'Use editor element/mark kinds definition',
          },
          {
            name: '@udecode/plate-common',
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
            name: '@udecode/plate-common',
            importNames: ['insertNodes'],
            message:
              'Node insertion should be done through @decipad/editor-utils',
          },
          {
            name: '@udecode/plate-common',
            importNames: ['getAboveNode'],
            message:
              'Should use the safe version getAboveNodeSafe in @decipad/editor-utils',
          },
          {
            name: '@udecode/plate-common',
            importNames: ['getNodeEntry'],
            message:
              'Should use the safe version getNodeEntrySafe in @decipad/editor-utils',
          },
          {
            name: '@udecode/plate-common',
            importNames: ['setSelection'],
            message:
              'Should use the safe version setSelection in @decipad/editor-utils',
          },
        ],
      },
    ],
  },
};

