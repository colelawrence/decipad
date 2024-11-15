import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  createMyPlateEditor,
  MyElement,
  ELEMENT_SMART_REF,
} from '@decipad/editor-types';
import { Path } from 'slate';
import { insertSmartRef } from './insertSmartRef';
import { Computer } from '@decipad/computer';
import { getNode, insertText } from '@udecode/plate-common';

vi.mock('nanoid', () => ({ nanoid: () => 'randomId' }));

const editor = createMyPlateEditor({
  plugins: [
    {
      key: ELEMENT_SMART_REF,
      isElement: true,
      isInline: true,
      isVoid: true,
    },
  ],
});

editor.rootEditor =
  'the function that depends on this is mocked, but it still has to be here';

const computer = new Computer();

beforeEach(() => {
  editor.children = [
    {
      type: ELEMENT_CODE_LINE,
      children: [{ text: '' }],
    },
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: '' }],
    },
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'helloworld' }],
    },
  ] as any;
});

describe('when inserting into a code line', () => {
  const codeLinePath = [0];

  it('can insert an expression', () => {
    insertSmartRef(editor, {
      computer,
      at: { path: [...codeLinePath, 0], offset: 0 },
      expression: 'my expression',
    });

    expect(getNode<MyElement>(editor, codeLinePath)?.children)
      .toMatchInlineSnapshot(`
        [
          {
            "text": " my expression ",
          },
        ]
      `);
  });

  it('can insert a block ID', () => {
    insertSmartRef(editor, {
      computer,
      at: { path: [...codeLinePath, 0], offset: 0 },
      blockId: 'myBlock',
    });

    expect(getNode<MyElement>(editor, codeLinePath)?.children)
      .toMatchInlineSnapshot(`
        [
          {
            "text": " ",
          },
          {
            "blockId": "myBlock",
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

  it('adds + if it will parse to something good', () => {
    const before = '1 ';
    const after = '';
    const offset = before.length;
    insertText(editor, before + after, { at: [...codeLinePath, 0] });

    insertSmartRef(editor, {
      computer,
      at: { path: [...codeLinePath, 0], offset },
      expression: 'my expression',
    });

    expect(getNode<MyElement>(editor, codeLinePath)?.children)
      .toMatchInlineSnapshot(`
        [
          {
            "text": "1 + my expression ",
          },
        ]
      `);
  });

  it('eliminates spurious spaces', () => {
    const before = 'hello ';
    const after = ' world';
    const offset = before.length;
    insertText(editor, before + after, { at: [...codeLinePath, 0] });

    insertSmartRef(editor, {
      computer,
      at: { path: [...codeLinePath, 0], offset },
      blockId: 'myBlock',
    });

    expect(getNode<MyElement>(editor, codeLinePath)?.children)
      .toMatchInlineSnapshot(`
        [
          {
            "text": "hello + ",
          },
          {
            "blockId": "myBlock",
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
            "text": " + world",
          },
        ]
      `);
  });
});

describe('when inserting into empty paragraph', () => {
  const paragraphPath = [1];

  it('can insert a block ID as a metric block', () => {
    insertSmartRef(editor, {
      computer,
      at: { path: [...paragraphPath, 0], offset: 0 },
      blockId: 'myBlock',
    });

    expect(getNode<MyElement>(editor, Path.next(paragraphPath)))
      .toMatchInlineSnapshot(`
        {
          "blockId": "myBlock",
          "caption": "Metric",
          "children": [
            {
              "text": "",
            },
          ],
          "comparisonBlockId": "",
          "comparisonDescription": "",
          "id": "randomId",
          "type": "metric",
        }
      `);
  });

  it('can insert an expression as a metric block', () => {
    insertSmartRef(editor, {
      computer,
      at: { path: [...paragraphPath, 0], offset: 0 },
      expression: 'my expresison',
      convertExpressionToSmartRef: () => 'myConvertedBlock',
    });

    expect(getNode<MyElement>(editor, Path.next(paragraphPath)))
      .toMatchInlineSnapshot(`
        {
          "blockId": "myConvertedBlock",
          "caption": "Metric",
          "children": [
            {
              "text": "",
            },
          ],
          "comparisonBlockId": "",
          "comparisonDescription": "",
          "id": "randomId",
          "type": "metric",
        }
      `);
  });

  it('inserts functions as math blocks', () => {
    insertSmartRef(editor, {
      computer: {
        getBlockIdResult$: {
          get: () => ({
            result: { type: { kind: 'function' } },
          }),
        },
      } as any,
      at: { path: [...paragraphPath, 0], offset: 0 },
      blockId: 'myBlock',
    });

    expect(getNode<MyElement>(editor, Path.next(paragraphPath)))
      .toMatchInlineSnapshot(`
        {
          "blockId": "myBlock",
          "children": [
            {
              "text": "",
            },
          ],
          "id": "randomId",
          "type": "math",
        }
      `);
  });
});

describe('when inserting into non-empty paragraph', () => {
  const paragraphPath = [2];
  const paragraphOffset = 'hello'.length;

  it('can insert a block ID as a magic number', () => {
    insertSmartRef(editor, {
      computer,
      at: { path: [...paragraphPath, 0], offset: paragraphOffset },
      blockId: 'myBlock',
    });

    expect(getNode<MyElement>(editor, paragraphPath)).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "text": "hello",
            },
            {
              "magicnumberz": true,
              "text": "exprRef_myBlock",
            },
            {
              "text": "world",
            },
          ],
          "type": "p",
        }
      `);
  });

  it('can insert an expression as a magic number', () => {
    insertSmartRef(editor, {
      computer,
      at: { path: [...paragraphPath, 0], offset: paragraphOffset },
      expression: 'my expresison',
      convertExpressionToSmartRef: () => 'myConvertedBlock',
    });

    expect(getNode<MyElement>(editor, paragraphPath)).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "text": "hello",
            },
            {
              "magicnumberz": true,
              "text": "exprRef_myConvertedBlock",
            },
            {
              "text": "world",
            },
          ],
          "type": "p",
        }
      `);
  });
});
