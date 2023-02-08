import {
  createTPlateEditor,
  ELEMENT_CODE_LINE,
  MyEditor,
} from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';
import { commitAutocompleteItem } from './commitAutocompleteItem';

let editor: MyEditor;
beforeEach(() => {
  editor = createTPlateEditor();
});

it('inserts the item, surrounded by spaces as necessary', () => {
  editor.children = [
    {
      type: ELEMENT_CODE_LINE,
      children: [{ text: 'hi +worl*' }],
    },
  ] as unknown as MyEditor['children'];

  commitAutocompleteItem(
    editor,
    {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 8 },
    },
    {
      identifier: 'INSERTED',
      kind: 'variable',
      type: '',
    }
  );

  expect(getNodeString(editor)).toMatchInlineSnapshot(`"hi + INSERTED *"`);
});

it('removes spaces at the beginning of the line', () => {
  editor.children = [
    {
      type: ELEMENT_CODE_LINE,
      children: [{ text: 'worl' }],
    },
  ] as unknown as MyEditor['children'];

  commitAutocompleteItem(
    editor,
    {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    },
    {
      identifier: 'INSERTED',
      kind: 'variable',
      type: '',
    }
  );

  expect(getNodeString(editor)).toMatchInlineSnapshot(`"INSERTED "`);
});

it('removes spaces after parens', () => {
  editor.children = [
    {
      type: ELEMENT_CODE_LINE,
      children: [{ text: 'fun(HERE' }],
    },
  ] as unknown as MyEditor['children'];

  commitAutocompleteItem(
    editor,
    {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 8 },
    },
    {
      identifier: 'INSERTED',
      kind: 'variable',
      type: '',
    }
  );

  expect(getNodeString(editor)).toMatchInlineSnapshot(`"fun(INSERTED "`);
});
