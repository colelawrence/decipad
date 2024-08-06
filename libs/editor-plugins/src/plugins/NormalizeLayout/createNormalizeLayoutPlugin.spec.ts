import type { TEditor } from '@udecode/plate-common';
import { normalizeEditor } from '@udecode/plate-common';
import type { LayoutElement } from '@decipad/editor-types';
import {
  createMyPlateEditor,
  ELEMENT_IMAGE,
  ELEMENT_LAYOUT,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
} from '@decipad/editor-types';
import { insertNodes } from '@decipad/editor-utils';
import { createNormalizeLayoutPlugin } from './createNormalizeLayoutPlugin';
import { nanoid } from 'nanoid';

let editor: TEditor;
beforeEach(() => {
  editor = createMyPlateEditor({
    plugins: [createNormalizeLayoutPlugin()],
  });
});

it('cannot be empty', () => {
  editor.children = [
    {
      type: ELEMENT_LAYOUT,
      id: nanoid(),
      width: 'full',
      children: [] as any,
    } satisfies LayoutElement,
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toHaveLength(0);
});

it('can contain any number of elements', () => {
  editor.children = [
    {
      type: ELEMENT_LAYOUT,
      id: nanoid(),
      width: 'full',
      children: [
        { type: ELEMENT_PARAGRAPH, children: [{ text: 'First' }] },
      ] as any,
    } satisfies LayoutElement,
  ];

  normalizeEditor(editor, { force: true });

  expect(editor.children).toHaveLength(1);
  expect(editor.children[0]).toHaveProperty('type', ELEMENT_LAYOUT);
  expect((editor.children[0] as LayoutElement).children).toHaveLength(1);

  insertNodes(
    editor,
    [
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'Second' }],
      },
    ],
    { at: [0, 1] }
  );

  normalizeEditor(editor, { force: true });

  expect(editor.children).toHaveLength(1);
  expect(editor.children[0]).toHaveProperty('type', ELEMENT_LAYOUT);
  expect((editor.children[0] as LayoutElement).children).toHaveLength(2);

  insertNodes(
    editor,
    [
      {
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
      },
    ],
    { at: [0, 2] }
  );

  normalizeEditor(editor, { force: true });

  expect(editor.children).toHaveLength(1);
  expect(editor.children[0]).toHaveProperty('type', ELEMENT_LAYOUT);
  expect((editor.children[0] as LayoutElement).children).toHaveLength(3);
});

it('cannot contain tables', () => {
  editor.children = [
    {
      type: ELEMENT_LAYOUT,
      id: nanoid(),
      width: 'full',
      children: [{ type: ELEMENT_TABLE, children: [{ text: '' }] }] as any,
    } satisfies LayoutElement,
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toHaveLength(1);
  expect(editor.children[0]).toHaveProperty('type', ELEMENT_TABLE);
});

it('children can have columnWidth', () => {
  editor.children = [
    {
      type: ELEMENT_LAYOUT,
      children: [
        { type: ELEMENT_PARAGRAPH, columnWidth: 2, children: [{ text: '' }] },
        { type: ELEMENT_PARAGRAPH, columnWidth: 1, children: [{ text: '' }] },
      ],
    },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_LAYOUT,
      children: [
        { type: ELEMENT_PARAGRAPH, columnWidth: 2, children: [{ text: '' }] },
        { type: ELEMENT_PARAGRAPH, columnWidth: 1, children: [{ text: '' }] },
      ],
    },
  ]);
});

it('elements not inside a layout cannot have columnWidth', () => {
  editor.children = [
    {
      type: 'wrapper',
      children: [
        { type: ELEMENT_PARAGRAPH, columnWidth: 1, children: [{ text: '' }] },
      ],
    },
    { type: ELEMENT_PARAGRAPH, columnWidth: 2, children: [{ text: '' }] },
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: 'wrapper',
      children: [{ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] }],
    },
    { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] },
  ]);
});

it('unwraps single-column layouts with no width prop', () => {
  editor.children = [
    {
      type: ELEMENT_LAYOUT,
      id: nanoid(),
      children: [{ type: ELEMENT_IMAGE, children: [{ text: '' }] }] as any,
    } satisfies LayoutElement,
  ];

  normalizeEditor(editor, { force: true });
  expect(editor.children[0]).toHaveProperty('type', ELEMENT_IMAGE);
});

it('unwraps single-column layouts with default width', () => {
  editor.children = [
    {
      type: ELEMENT_LAYOUT,
      id: nanoid(),
      width: 'default',
      children: [{ type: ELEMENT_IMAGE, children: [{ text: '' }] }] as any,
    } satisfies LayoutElement,
  ];

  normalizeEditor(editor, { force: true });
  expect(editor.children[0]).toHaveProperty('type', ELEMENT_IMAGE);
});

it('does not unwrap single-column layouts with full width', () => {
  editor.children = [
    {
      type: ELEMENT_LAYOUT,
      id: nanoid(),
      width: 'full',
      children: [{ type: ELEMENT_IMAGE, children: [{ text: '' }] }] as any,
    } satisfies LayoutElement,
  ];

  normalizeEditor(editor, { force: true });
  expect(editor.children[0]).toHaveProperty('type', ELEMENT_LAYOUT);
});

it('does not unwrap layouts with multiple columns', () => {
  editor.children = [
    {
      type: ELEMENT_LAYOUT,
      id: nanoid(),
      width: 'default',
      children: [
        { type: ELEMENT_IMAGE, children: [{ text: '' }] },
        { type: ELEMENT_IMAGE, children: [{ text: '' }] },
      ] as any,
    } satisfies LayoutElement,
  ];

  normalizeEditor(editor, { force: true });
  expect(editor.children[0]).toHaveProperty('type', ELEMENT_LAYOUT);
});
