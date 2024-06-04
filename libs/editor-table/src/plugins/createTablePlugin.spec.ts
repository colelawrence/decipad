import type { PlatePlugin, TEditor } from '@udecode/plate-common';
import { createPlateEditor, normalizeEditor } from '@udecode/plate-common';
import { createNodeIdPlugin } from '@udecode/plate-node-id';
import { nanoid } from 'nanoid';
import type { MyValue } from '@decipad/editor-types';
import { getComputer } from '@decipad/computer';
import fixtureDoc from '../__fixtures__/001_doc.json';
import { createTablePlugin } from './createTablePlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createPlateEditor({
    plugins: [
      createNodeIdPlugin({ options: { idCreator: nanoid } }),
      createTablePlugin(getComputer()) as PlatePlugin,
    ],
  });
});

it('works for a very weird table', () => {
  editor.children = fixtureDoc.children as unknown as MyValue;
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
    {
      children: [
        {
          children: [
            {
              children: [
                {
                  text: 'Compensation',
                },
              ],
              type: 'table-var-name',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              columnId: 'O6Zn_72P5z3gasIK8q3JD',
              type: 'table-column-formula',
            },
          ],
          type: 'table-caption',
        },
        {
          children: [
            {
              cellType: {
                kind: 'string',
              },
              children: [
                {
                  text: 'Name',
                },
              ],
              type: 'th',
            },
            {
              cellType: {
                kind: 'number',
                unit: [
                  {
                    exp: {
                      d: '1',
                      n: '1',
                      s: '1',
                    },
                    known: true,
                    multiplier: {
                      d: '1',
                      n: '1',
                      s: '1',
                    },
                    unit: 'gbp',
                  },
                  {
                    exp: {
                      d: '1',
                      n: '1',
                      s: '-1',
                    },
                    known: true,
                    multiplier: {
                      d: '1',
                      n: '1',
                      s: '1',
                    },
                    unit: 'years',
                  },
                ],
              },
              children: [
                {
                  text: 'Base',
                },
              ],
              type: 'th',
            },
            {
              cellType: {
                kind: 'number',
                unit: [
                  {
                    exp: {
                      d: '1',
                      n: '1',
                      s: '1',
                    },
                    known: false,
                    multiplier: {
                      d: '1',
                      n: '1',
                      s: '1',
                    },
                    unit: 'options',
                  },
                ],
              },
              children: [
                {
                  text: 'Equity',
                },
              ],
              type: 'th',
            },
            {
              cellType: {
                kind: 'table-formula',
                source: 'Equity * SharePrice',
              },
              children: [
                {
                  text: 'EquityValue',
                },
              ],
              type: 'th',
            },
          ],
          type: 'tr',
        },
        {
          children: [
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'td',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'td',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'td',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'td',
            },
          ],
          type: 'tr',
        },
      ],
      color: 'Sun',
      icon: 'ShoppingCart',
      type: 'table',
    },
  ]);
});
