import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  createTPlateEditor,
} from '@decipad/editor-types';
import { createRemoveH1 } from './createRemoveH1';
import { normalizeEditor } from '@udecode/plate-common';

const editor = createTPlateEditor({
  plugins: [createRemoveH1()],
});

it('Removes H1 nodes', () => {
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

  expect(editor.children).toHaveLength(0);
});

it('Removes H1 nodes but leaves others', () => {
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

  expect(editor.children).toHaveLength(2);
  expect(editor.children.find((n) => n.type === ELEMENT_H1)).toBeUndefined();
});
