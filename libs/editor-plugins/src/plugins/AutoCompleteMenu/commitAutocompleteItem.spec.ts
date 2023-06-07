import {
  createTPlateEditor,
  ELEMENT_CODE_LINE,
  MyEditor,
} from '@decipad/editor-types';
import { ACItemType } from '@decipad/ui';
import { getNodeString } from '@udecode/plate';
import { BasePoint } from 'slate';
import { setSelection } from '@decipad/editor-utils';
import { commitAutocompleteItem } from './commitAutocompleteItem';

let editor: MyEditor;
beforeEach(() => {
  editor = createTPlateEditor();
});

const selection = (point: BasePoint) => ({ anchor: point, focus: point });
it('inserts the item, surrounded by spaces as necessary', () => {
  editor.children = [
    {
      type: ELEMENT_CODE_LINE,
      children: [{ text: 'hi +worl*' }],
    },
  ] as unknown as MyEditor['children'];
  setSelection(editor, selection({ path: [0, 0], offset: 8 }));

  commitAutocompleteItem(
    editor,
    {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 8 },
    },
    {
      identifier: 'INSERTED',
      kind: 'variable',
      type: 'string' as ACItemType,
    }
  );

  expect(getNodeString(editor)).toMatchInlineSnapshot(`"hi + INSERTED *"`);
  expect(editor.selection?.anchor).toMatchInlineSnapshot(`
    Object {
      "offset": 14,
      "path": Array [
        0,
        0,
      ],
    }
  `);
});

it('removes spaces at the beginning of the line', () => {
  editor.children = [
    {
      type: ELEMENT_CODE_LINE,
      children: [{ text: 'worl' }],
    },
  ] as unknown as MyEditor['children'];
  setSelection(editor, selection({ path: [0, 0], offset: 4 }));

  commitAutocompleteItem(
    editor,
    {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    },
    {
      identifier: 'INSERTED',
      kind: 'variable',
      type: 'string' as ACItemType,
    }
  );

  expect(getNodeString(editor)).toMatchInlineSnapshot(`"INSERTED "`);
  expect(editor.selection?.anchor).toMatchInlineSnapshot(`
    Object {
      "offset": 9,
      "path": Array [
        0,
        0,
      ],
    }
  `);
});

it('removes spaces after parens', () => {
  editor.children = [
    {
      type: ELEMENT_CODE_LINE,
      children: [{ text: 'fun(HERE' }],
    },
  ] as unknown as MyEditor['children'];
  setSelection(editor, selection({ path: [0, 0], offset: 8 }));

  commitAutocompleteItem(
    editor,
    {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 8 },
    },
    {
      identifier: 'INSERTED',
      kind: 'variable',
      type: 'string' as ACItemType,
    }
  );

  expect(getNodeString(editor)).toMatchInlineSnapshot(`"fun(INSERTED "`);
  expect(editor.selection?.anchor).toMatchInlineSnapshot(`
    Object {
      "offset": 13,
      "path": Array [
        0,
        0,
      ],
    }
  `);
});
