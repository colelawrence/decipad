import { beforeEach, expect, it } from 'vitest';
import type { MyEditor } from '@decipad/editor-types';
import { createMyPlateEditor, ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate-common';
import type { BasePoint } from 'slate';
import { setSelection } from '@decipad/editor-utils';
import { commitAutocompleteItem } from './commitAutocompleteItem';

let editor: MyEditor;
beforeEach(() => {
  editor = createMyPlateEditor();
});

const selection = (point: BasePoint) => ({ anchor: point, focus: point });
it('inserts the item, without adding spaces', () => {
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
      name: 'INSERTED',
      autocompleteGroup: 'variable',
      kind: 'string',
    }
  );

  expect(getNodeString(editor)).toMatchInlineSnapshot(`"hi + INSERTED*"`);
  expect(editor.selection?.anchor).toMatchInlineSnapshot(`
    {
      "offset": 13,
      "path": [
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
      name: 'INSERTED',
      autocompleteGroup: 'variable',
      kind: 'string',
    }
  );

  expect(getNodeString(editor)).toMatchInlineSnapshot(`"INSERTED"`);
  expect(editor.selection?.anchor).toMatchInlineSnapshot(`
    {
      "offset": 8,
      "path": [
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
      name: 'INSERTED',
      autocompleteGroup: 'variable',
      kind: 'string',
    }
  );

  expect(getNodeString(editor)).toMatchInlineSnapshot(`"fun(INSERTED"`);
  expect(editor.selection?.anchor).toMatchInlineSnapshot(`
    {
      "offset": 12,
      "path": [
        0,
        0,
      ],
    }
  `);
});
