import { getComputer } from '@decipad/computer';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@decipad/editor-types';
import type { TEditor } from '@udecode/plate-common';
import { createPlateEditor, normalizeEditor } from '@udecode/plate-common';
import { createNormalizeTableFormulaAndSeriesCellsPlugin } from './createNormalizeTableFormulaAndSeriesCellsPlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createPlateEditor({
    plugins: [createNormalizeTableFormulaAndSeriesCellsPlugin(getComputer())],
  });
});

it('cleans existing text in table formula cells', () => {
  editor.children = [
    {
      type: ELEMENT_TABLE,
      children: [
        { type: ELEMENT_TABLE_CAPTION, children: [{ text: 'TableName' }] },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'string',
              },
              children: [{ text: '' }],
            },
            {
              type: ELEMENT_TH,
              cellType: {
                kind: 'table-formula',
              },
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: 'allowed' }],
            },
            {
              type: ELEMENT_TD,
              children: [{ text: 'not allowed' }],
            },
          ],
        },
      ],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
    {
      type: 'table',
      children: [
        { type: ELEMENT_TABLE_CAPTION, children: [{ text: 'TableName' }] },
        {
          type: 'tr',
          children: [
            { type: 'th', cellType: { kind: 'string' } },
            { type: 'th', cellType: { kind: 'table-formula' } },
          ],
        },
        {
          type: 'tr',
          children: [
            { type: 'td', children: [{ text: 'allowed' }] },
            { type: 'td', children: [{ text: '' }] },
          ],
        },
      ],
    },
  ]);
});
