import { createEditor } from 'slate';
import { normalizeCurried } from './normalizeNode';
import { normalizers } from './plugins';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import type { TEditor } from '@udecode/plate-common';
import { vi, it, expect } from 'vitest';
import {
  ELEMENT_DATA_TAB,
  ELEMENT_TAB,
  ELEMENT_TITLE,
} from '@decipad/editor-types';

vi.mock('nanoid', () => ({
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
    type: ELEMENT_TITLE,
  },
  {
    type: ELEMENT_DATA_TAB,
    children: [],
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
    type: ELEMENT_TAB,
  },
];

it('normalizes empty notebook', () => {
  editor.children = [];
  editor.normalize();

  // Title + DataTab + Tab
  expect(editor.children).toHaveLength(3);
  expect(editor.children).toMatchObject(EXPECTED_NOTEBOOK);
});

it('shifts title to the correct place', () => {
  editor.children = [
    {
      type: ELEMENT_DATA_TAB,
      children: [],
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

  expect(editor.children).toHaveLength(3);
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

  expect(editor.children).toHaveLength(3);
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
      type: ELEMENT_DATA_TAB,
      children: [],
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
      type: ELEMENT_DATA_TAB,
      children: [],
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

it('only allows one data tab per notebook', () => {
  editor.children = [
    {
      type: 'tab',
      children: [{ type: 'p', children: [{ text: 'tab paragraph' }] }],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'first-one',
      children: [],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'second-one',
      children: [],
    },
    {
      type: 'title',
      children: [{ text: 'my title' }],
    },
  ] as any;

  editor.normalize();

  expect(editor.children).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "text": "my title",
          },
        ],
        "type": "title",
      },
      {
        "children": [],
        "id": "first-one",
        "type": "data-tab",
      },
      {
        "children": [
          {
            "children": [
              {
                "text": "tab paragraph",
              },
            ],
            "type": "p",
          },
        ],
        "type": "tab",
      },
    ]
  `);
});

it('prefer to keep the data tab with most children', () => {
  editor.children = [
    {
      type: 'tab',
      children: [{ type: 'p', children: [{ text: 'tab paragraph' }] }],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'first-one',
      children: [],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'second-one',
      children: [
        {
          text: 'some claculation',
        },
      ],
    },
    {
      type: 'title',
      children: [{ text: 'my title' }],
    },
  ] as any;

  editor.normalize();

  expect(editor.children).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "text": "my title",
          },
        ],
        "type": "title",
      },
      {
        "children": [
          {
            "text": "some claculation",
          },
        ],
        "id": "second-one",
        "type": "data-tab",
      },
      {
        "children": [
          {
            "children": [
              {
                "text": "tab paragraph",
              },
            ],
            "type": "p",
          },
        ],
        "type": "tab",
      },
    ]
  `);
});

it('keeps the children from a data tab that is removed', () => {
  editor.children = [
    {
      type: 'tab',
      children: [{ type: 'p', children: [{ text: 'tab paragraph' }] }],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'first-one',
      children: [
        {
          id: '1',
          text: 'more calculations',
        },
        {
          id: '2',
          text: 'even more calculations',
        },
      ],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'second-one',
      children: [
        {
          id: '3',
          text: 'some claculation',
        },
      ],
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
          id: '3',
          text: 'some claculation',
        },
        {
          id: '1',
          text: 'more calculations',
        },
        {
          id: '2',
          text: 'even more calculations',
        },
      ],
      id: 'first-one',
      type: 'data-tab',
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

it('Merges all children from all data tabs regarless of position.', () => {
  editor.children = [
    {
      type: 'tab',
      children: [{ type: 'p', children: [{ text: 'tab paragraph' }] }],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'first-one',
      children: [
        {
          id: '1',
          text: 'more calculations',
        },
        {
          id: '2',
          text: 'even more calculations',
        },
      ],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'second-one',
      children: [
        {
          id: '3',
          text: 'some claculation',
        },
      ],
    },
    {
      type: 'title',
      children: [{ text: 'my title' }],
    },
    {
      type: ELEMENT_DATA_TAB,
      id: 'third-one',
      children: [
        {
          id: '4',
          text: '4',
        },
        {
          id: '5',
          text: '5',
        },
        {
          id: '6',
          text: '6',
        },
        {
          id: '7',
          text: '7',
        },
      ],
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
          id: '3',
          text: 'some claculation',
        },
        {
          id: '3',
          text: 'some claculation',
        },
        {
          id: '2',
          text: 'even more calculations',
        },
        {
          id: '1',
          text: 'more calculations',
        },
        {
          id: '4',
          text: '4',
        },
        {
          id: '5',
          text: '5',
        },
        {
          id: '6',
          text: '6',
        },
        {
          id: '7',
          text: '7',
        },
      ],
      id: 'third-one',
      type: 'data-tab',
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
