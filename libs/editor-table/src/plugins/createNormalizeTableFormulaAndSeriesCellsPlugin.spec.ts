import { Computer } from '@decipad/computer';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@decipad/editor-types';
import { createPlateEditor, normalizeEditor, TEditor } from '@udecode/plate';
import { createNormalizeTableFormulaAndSeriesCellsPlugin } from './createNormalizeTableFormulaAndSeriesCellsPlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createPlateEditor({
    plugins: [createNormalizeTableFormulaAndSeriesCellsPlugin(new Computer())],
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

it('ensures that a formula column is not the first column', () => {
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
              cellType: { kind: 'table-formula', source: '1 + 1' },
              children: [{ text: 'FormulaColName' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            { id: 'formula-td', type: ELEMENT_TD, children: [{ text: '' }] },
          ],
        },
      ],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
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
                source: '1 + 1',
              },
              children: [{ text: 'FormulaColName' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          children: [
            { type: ELEMENT_TD },
            { id: 'formula-td', type: ELEMENT_TD, children: [{ text: '' }] },
          ],
        },
      ],
    },
  ]);
});
