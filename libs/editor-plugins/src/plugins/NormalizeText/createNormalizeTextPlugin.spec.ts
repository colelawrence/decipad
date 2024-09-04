import { beforeEach, expect, it } from 'vitest';
import {
  createMyPlateEditor,
  ELEMENT_PARAGRAPH,
  MARK_BOLD,
} from '@decipad/editor-types';
import type { TEditor } from '@udecode/plate-common';
import { normalizeEditor } from '@udecode/plate-common';
import { createNormalizeTextPlugin } from './createNormalizeTextPlugin';

let editor: TEditor;
beforeEach(() => {
  editor = createMyPlateEditor({
    plugins: [createNormalizeTextPlugin()],
  });
});

it('allows rich text marks on text', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'text', [MARK_BOLD]: true }],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    expect.objectContaining({
      children: [
        {
          text: 'text',
          [MARK_BOLD]: true,
        },
      ],
    }),
  ]);
});

it('forbids unknown marks on text', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'text', bs: true }],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    expect.objectContaining({
      children: [{ text: 'text' }],
    }),
  ]);
});
