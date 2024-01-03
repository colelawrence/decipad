import { getRemoteComputer, RemoteComputer } from '@decipad/remote-computer';
import {
  CodeLineElement,
  createTPlateEditor,
  ELEMENT_CODE_LINE,
  ELEMENT_SMART_REF,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TH,
  ELEMENT_TR,
  MyEditor,
  MyValue,
  TableElement,
} from '@decipad/editor-types';
import { convertCodeSmartRefs, createCodeLine } from '@decipad/editor-utils';
import { editorToProgram } from '@decipad/editor-language-elements';
import { timeout } from '@decipad/utils';
import { BaseEditor, Editor } from 'slate';
import { createSmartRefPlugin } from './createSmartRefPlugin';

type VarAndCol = [string, string?];

jest.mock('nanoid', () => ({
  nanoid: () => 'nanoid()',
}));

let editor: MyEditor;
let computer: RemoteComputer;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createSmartRefPlugin()],
  });
  editor.children = [
    {
      type: ELEMENT_TABLE,
      id: 'Table1Id',
      children: [
        {
          type: ELEMENT_TABLE_CAPTION,
          id: '1',
          children: [
            {
              type: ELEMENT_TABLE_VARIABLE_NAME,
              id: '1',
              children: [{ text: 'Table1' }],
            },
          ],
        },
        {
          type: ELEMENT_TR,
          id: '1',
          children: [
            {
              type: ELEMENT_TH,
              id: 'Column1Id',
              children: [{ text: 'Column1' }],
              cellType: { kind: 'anything' },
            },
          ],
        },
      ],
    } as TableElement,
    createCodeLine({ id: 'varId', code: 'var = 1' }),
  ] as unknown as MyValue;

  computer = getRemoteComputer();
});

it('can turn text into smartrefs', async () => {
  editor.children = [
    ...editor.children,
    createCodeLine({ id: '2', code: 'var' }),
  ];
  computer.pushCompute({
    program: await editorToProgram(editor, editor.children, computer),
  });
  await timeout(0);

  const names = computer
    .getNamesDefined()
    .flatMap((n): [VarAndCol, VarAndCol][] => {
      if (n.kind === 'variable' && n.blockId) {
        return [[[n.name], [n.blockId]]];
      }
      if (n.kind === 'column' && n.blockId && n.columnId) {
        return [
          [n.name.split('.') as [string, string], [n.blockId, n.columnId]],
        ];
      }
      return [];
    });
  convertCodeSmartRefs(editor, [2], names);

  expect(editor.children[2].children[1]).toMatchInlineSnapshot(`
    Object {
      "blockId": "varId",
      "children": Array [
        Object {
          "text": "",
        },
      ],
      "columnId": null,
      "id": "nanoid()",
      "type": "smart-ref",
    }
  `);
});

it('can turn text into smartrefs (columns edition)', async () => {
  editor.children = [
    ...editor.children,
    createCodeLine({ id: '2', code: 'Table1.Column1' }),
  ];

  computer.pushCompute({
    program: await editorToProgram(editor, editor.children, computer),
  });
  await timeout(0);

  const names = computer
    .getNamesDefined()
    .flatMap((n): [VarAndCol, VarAndCol][] => {
      if (n.kind === 'variable' && n.blockId) {
        return [[[n.name], [n.blockId]]];
      }
      if (n.kind === 'column' && n.blockId && n.columnId) {
        return [
          [n.name.split('.') as [string, string], [n.blockId, n.columnId]],
        ];
      }
      return [];
    });
  convertCodeSmartRefs(editor, [2], names);

  expect(editor.children[2].children[1]).toMatchInlineSnapshot(`
    Object {
      "blockId": "Table1Id",
      "children": Array [
        Object {
          "text": "",
        },
      ],
      "columnId": "Column1Id",
      "id": "nanoid()",
      "type": "smart-ref",
    }
  `);
});

it('migrates old-style smart refs (just col ID) to NEW SMART REFS (blockId + colId)', () => {
  editor.children.push({
    type: ELEMENT_CODE_LINE,
    id: '2',
    children: [
      {
        type: ELEMENT_SMART_REF,
        id: 'nanoid()',
        blockId: 'Column1Id',
        children: [{ text: '' }],
      },
    ],
  } as CodeLineElement);

  Editor.normalize(editor as BaseEditor, { force: true });

  expect(editor.children[2].children[1]).toMatchInlineSnapshot(`
    Object {
      "blockId": "Table1Id",
      "children": Array [
        Object {
          "text": "",
        },
      ],
      "columnId": "Column1Id",
      "id": "nanoid()",
      "type": "smart-ref",
    }
  `);
});
