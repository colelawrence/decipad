import { expect, it, vi } from 'vitest';
import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import type { Text } from 'slate';
import { insertSmartRef } from './insertSmartRef';

vi.mock('nanoid', () => ({ nanoid: () => 'randomId' }));

it('can insert a smart ref', () => {
  const ref = insertSmartRef(ELEMENT_CODE_LINE, 'block-id', null);

  expect(ref).toMatchInlineSnapshot(`
    [
      {
        "text": " ",
      },
      {
        "blockId": "block-id",
        "children": [
          {
            "text": "",
          },
        ],
        "columnId": null,
        "id": "randomId",
        "type": "smart-ref",
      },
      {
        "text": " ",
      },
    ]
  `);
});

it('can insert a smart ref into table formula', () => {
  const ref = insertSmartRef(ELEMENT_TABLE_COLUMN_FORMULA, 'block-id', null);

  expect(ref).toMatchInlineSnapshot(`
    [
      {
        "text": " ",
      },
      {
        "blockId": "block-id",
        "children": [
          {
            "text": "",
          },
        ],
        "columnId": null,
        "id": "randomId",
        "type": "smart-ref",
      },
      {
        "text": " ",
      },
    ]
  `);
});

it('can insert a magic number into a paragraph', () => {
  const newNodes = insertSmartRef(ELEMENT_PARAGRAPH, 'block-id', null);

  expect(newNodes).toMatchInlineSnapshot(`
    [
      {
        "magicnumberz": true,
        "text": "exprRef_block_id",
      },
    ]
  `);
});

it('adds + if it will parse to something good', () => {
  const newNodes = insertSmartRef(ELEMENT_CODE_LINE, 'block-id', null, '1');

  expect(newNodes).toMatchInlineSnapshot(`
    [
      {
        "text": " + ",
      },
      {
        "blockId": "block-id",
        "children": [
          {
            "text": "",
          },
        ],
        "columnId": null,
        "id": "randomId",
        "type": "smart-ref",
      },
      {
        "text": " ",
      },
    ]
  `);
});

it('eliminates spurious spaces', () => {
  const [before, , after] = insertSmartRef(
    ELEMENT_CODE_LINE,
    'block-id',
    null,
    'hello ',
    ' world'
  ) as Text[];

  expect(before).toMatchInlineSnapshot(`
    {
      "text": "+ ",
    }
  `);
  expect(after).toMatchInlineSnapshot(`
    {
      "text": " +",
    }
  `);
});
