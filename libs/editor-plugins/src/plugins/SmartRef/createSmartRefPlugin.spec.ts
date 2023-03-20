import { Computer } from '@decipad/computer';
import {
  CodeLineElement,
  createTPlateEditor,
  ELEMENT_SMART_REF,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TH,
  ELEMENT_TR,
  MyEditor,
  MyValue,
  TableElement,
} from '@decipad/editor-types';
import { ELEMENT_CODE_LINE, ELEMENT_TABLE } from '@udecode/plate';
import { createCodeLine, convertCodeSmartRefs } from '@decipad/editor-utils';
import { editorToProgram } from '@decipad/editor-language-elements';
import { timeout } from '@decipad/utils';
import { BaseEditor, Editor } from 'slate';
import { createSmartRefPlugin } from './createSmartRefPlugin';

jest.mock('nanoid', () => ({
  nanoid: () => 'nanoid()',
}));

let editor: MyEditor;
let computer: Computer;
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

  computer = new Computer({
    requestDebounceMs: 0,
  });
});

it('can turn text into smartrefs', async () => {
  editor.children = [
    ...editor.children,
    createCodeLine({ id: '2', code: 'var' }),
  ];

  computer.pushCompute(await editorToProgram(editor, computer));
  await timeout(0);

  convertCodeSmartRefs(editor, [2], computer);

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

  computer.pushCompute(await editorToProgram(editor, computer));
  await timeout(0);

  convertCodeSmartRefs(editor, [2], computer);

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

it('migrates old-style smart refs (just col ID) to NEW SMART REFS (blockId + colId)', async () => {
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
