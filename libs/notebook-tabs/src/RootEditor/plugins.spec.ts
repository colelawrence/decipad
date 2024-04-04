import { createEditor } from 'slate';
import { normalizeCurried } from './normalizeNode';
import { normalizers } from './plugins';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import type { TEditor } from '@udecode/plate-common';

jest.mock('nanoid', () => ({
  nanoid: () => 'mocked-id',
}));

const editor = createEditor() as TEditor;
editor.normalize = normalizeCurried(editor, normalizers(editor as TEditor));

const EXPECTED_NOTEBOOK = [
  {
    children: [
      {
        text: 'Welcome to Decipad!',
      },
    ],
    type: 'title',
  },
  {
    children: [
      {
        children: [
          {
            text: '',
          },
        ],
        type: 'p',
      },
    ],
    type: 'tab',
  },
];

it('normalizes empty notebook', () => {
  editor.children = [];
  editor.normalize();

  expect(editor.children).toHaveLength(2);
  expect(editor.children).toMatchObject(EXPECTED_NOTEBOOK);
});

it('shifts title to the correct place', () => {
  editor.children = [
    {
      children: [
        {
          children: [
            {
              text: '',
            },
          ],
          type: 'p',
        },
      ],
      type: 'tab',
    },
    {
      children: [
        {
          text: 'Welcome to Decipad!',
        },
      ],
      type: 'title',
    },
  ] as any;
  editor.normalize();

  expect(editor.children).toHaveLength(2);
  expect(editor.children).toMatchObject(EXPECTED_NOTEBOOK);
});

it('migrates old notebooks', () => {
  editor.children = [
    {
      type: ELEMENT_H1,
      children: [{ text: 'Old title' }],
    },
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'Old paragraph' }],
    },
  ] as any;

  editor.normalize();

  expect(editor.children).toHaveLength(2);
  expect(editor.children).toMatchObject([
    {
      children: [
        {
          text: 'Old title',
        },
      ],
      id: 'mocked-id',
      type: 'title',
    },
    {
      children: [
        {
          children: [
            {
              text: 'Old paragraph',
            },
          ],
          type: 'p',
        },
      ],
      name: 'First tab',
      id: 'mocked-id',
      type: 'tab',
    },
  ]);
});

it('fixes different order notebooks', () => {
  editor.children = [
    {
      type: 'tab',
      children: [{ type: 'p', children: [{ text: 'tab paragraph' }] }],
    },
    {
      type: 'title',
      children: [{ text: 'my title' }],
    },
  ] as any;

  editor.normalize();

  expect(editor.children).toMatchObject([
    {
      children: [
        {
          text: 'my title',
        },
      ],
      type: 'title',
    },
    {
      children: [
        {
          children: [
            {
              text: 'tab paragraph',
            },
          ],
          type: 'p',
        },
      ],
      type: 'tab',
    },
  ]);
});
