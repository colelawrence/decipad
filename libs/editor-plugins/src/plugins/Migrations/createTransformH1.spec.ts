import { expect, it } from 'vitest';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_PARAGRAPH,
  createMyPlateEditor,
} from '@decipad/editor-types';
import { createTransformH1 } from './createTransformH1';
import { normalizeEditor } from '@udecode/plate-common';

const editor = createMyPlateEditor({
  plugins: [createTransformH1()],
});

it('Transforms H1 nodes', () => {
  editor.children = [
    {
      type: ELEMENT_H1,
      children: [
        {
          text: 'hello',
        },
      ],
    } as never,
  ];

  normalizeEditor(editor, { force: true });

  expect(editor.children).toHaveLength(1);

  expect(editor.children[0]).toMatchObject({
    type: ELEMENT_H2,
    children: [
      {
        text: 'hello',
      },
    ],
  });
});

it('Transforms H1 nodes but leaves others', () => {
  editor.children = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [
        {
          text: 'just a simple p',
        },
      ],
    } as never,
    {
      type: ELEMENT_H1,
      children: [
        {
          text: 'hello',
        },
      ],
    } as never,
    {
      type: ELEMENT_PARAGRAPH,
      children: [
        {
          text: 'just a simple p',
        },
      ],
    } as never,
  ];

  normalizeEditor(editor, { force: true });

  expect(editor.children).toHaveLength(3);
  expect(editor.children.find((n) => n.type === ELEMENT_H1)).toBeUndefined();
  expect(editor.children.filter((n) => n.type === ELEMENT_H2)).toHaveLength(1);
});
