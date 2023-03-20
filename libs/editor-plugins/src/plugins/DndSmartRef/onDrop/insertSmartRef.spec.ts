import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { Text } from 'slate';
import { insertSmartRef } from './insertSmartRef';

jest.mock('nanoid', () => ({ nanoid: () => 'randomId' }));

it('can insert a smart ref', () => {
  const ref = insertSmartRef(ELEMENT_CODE_LINE, 'block-id', null);

  expect(ref).toMatchInlineSnapshot(`
    Array [
      Object {
        "text": " ",
      },
      Object {
        "blockId": "block-id",
        "children": Array [
          Object {
            "text": "",
          },
        ],
        "columnId": null,
        "id": "randomId",
        "type": "smart-ref",
      },
      Object {
        "text": " ",
      },
    ]
  `);
});

it('can insert a smart ref into table formula', () => {
  const ref = insertSmartRef(ELEMENT_TABLE_COLUMN_FORMULA, 'block-id', null);

  expect(ref).toMatchInlineSnapshot(`
    Array [
      Object {
        "text": " ",
      },
      Object {
        "blockId": "block-id",
        "children": Array [
          Object {
            "text": "",
          },
        ],
        "columnId": null,
        "id": "randomId",
        "type": "smart-ref",
      },
      Object {
        "text": " ",
      },
    ]
  `);
});

it('can insert a magic number into a paragraph', () => {
  const newNodes = insertSmartRef(ELEMENT_PARAGRAPH, 'block-id', null);

  expect(newNodes).toMatchInlineSnapshot(`
    Array [
      Object {
        "magicnumberz": true,
        "text": "exprRef_block_id",
      },
    ]
  `);
});

it('adds + if it will parse to something good', () => {
  const newNodes = insertSmartRef(ELEMENT_CODE_LINE, 'block-id', null, '1');

  expect(newNodes).toMatchInlineSnapshot(`
    Array [
      Object {
        "text": " + ",
      },
      Object {
        "blockId": "block-id",
        "children": Array [
          Object {
            "text": "",
          },
        ],
        "columnId": null,
        "id": "randomId",
        "type": "smart-ref",
      },
      Object {
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
    Object {
      "text": "+ ",
    }
  `);
  expect(after).toMatchInlineSnapshot(`
    Object {
      "text": " +",
    }
  `);
});
