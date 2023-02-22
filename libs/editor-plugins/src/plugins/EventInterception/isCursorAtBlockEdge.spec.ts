import { createTPlateEditor } from '@decipad/editor-types';
import { createLinkPlugin, select } from '@udecode/plate';
import { isCursorAtBlockEdge } from './isCursorAtBlockEdge';

const lastChar = 'text'.length;
it.each([
  // Inside a block elm with no inline children
  ['start', true, { path: [0, 0], offset: 0 }],
  ['start', false, { path: [0, 0], offset: 1 }],
  ['end', true, { path: [0, 0], offset: lastChar }],
  ['end', false, { path: [0, 0], offset: lastChar - 1 }],

  // Inside an inline element
  ['start', false, { path: [1, 1, 0], offset: 0 }],
  ['end', false, { path: [1, 1, 0], offset: lastChar }],

  // Just after an inline element
  ['start', false, { path: [1, 2], offset: 0 }],
  // Just before an inline element
  ['end', false, { path: [1, 1], offset: lastChar }],
])('detects edges', (edge, expected, location) => {
  const editor = createTPlateEditor({
    plugins: [createLinkPlugin()],
  });
  editor.children = [
    {
      type: 'h1',
      id: 'h1',
      children: [{ text: 'text' }],
    },
    {
      type: 'p',
      id: 'paragraph',
      children: [
        { text: 'text' },
        {
          type: 'a',
          id: 'link',
          url: 'http://example.com',
          children: [
            {
              text: 'text',
            },
          ],
        },
        { text: 'text' },
      ],
    },
  ];

  select(editor, location);
  expect(isCursorAtBlockEdge(editor, edge as 'start' | 'end')).toBe(expected);
});
