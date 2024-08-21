import { CodeLineV2Element, SmartRefElement } from '@decipad/editor-types';
import { EditorController } from '@decipad/notebook-tabs';
import { it, beforeEach } from 'vitest';
import { resetChanges } from './reset-changes';
import { createSmartRefPlugin } from '@decipad/editor-plugins';

const old: CodeLineV2Element = {
  type: 'code_line_v2',
  id: '1',
  children: [
    { type: 'structured_varname', id: '2', children: [{ text: 'varname' }] },
    { type: 'code_line_v2_code', id: '3', children: [{ text: '100' }] },
  ],
};

let controller = new EditorController('id', []);
beforeEach(() => {
  controller = new EditorController('id', [createSmartRefPlugin()]);
  controller.forceNormalize();

  controller.apply({
    type: 'insert_node',
    path: [2, 0],
    node: old,
  });
});

it('resets controller to old node for variable names', () => {
  const newElement: CodeLineV2Element = {
    type: 'code_line_v2',
    id: '1',
    children: [
      {
        type: 'structured_varname',
        id: '2',
        children: [{ text: 'varname changed' }],
      },
      { type: 'code_line_v2_code', id: '3', children: [{ text: '100' }] },
    ],
  };

  controller.apply({
    type: 'insert_text',
    path: [2, 0, 0, 0],
    offset: 'varname'.length,
    text: ' changed',
  });

  expect(controller.children[2].children[0].children[0]).toMatchInlineSnapshot(`
    {
      "children": [
        {
          "text": "varname changed",
        },
      ],
      "id": "2",
      "type": "structured_varname",
    }
  `);

  resetChanges(controller, [old, [2, 0]], [newElement, [2, 0]]);

  expect(controller.children[2].children[0].children[0]).toMatchInlineSnapshot(`
    {
      "children": [
        {
          "text": "varname",
        },
      ],
      "id": "2",
      "type": "structured_varname",
    }
  `);
});

it('resets to old node for code', () => {
  const newElement: CodeLineV2Element = {
    type: 'code_line_v2',
    id: '1',
    children: [
      {
        type: 'structured_varname',
        id: '2',
        children: [{ text: 'varname' }],
      },
      { type: 'code_line_v2_code', id: '3', children: [{ text: '100 + 100' }] },
    ],
  };

  controller.apply({
    type: 'insert_text',
    path: [2, 0, 1, 0],
    offset: '100'.length,
    text: ' + 100',
  });

  expect(controller.children[2].children[0].children[1]).toMatchInlineSnapshot(`
    {
      "children": [
        {
          "text": "100 + 100",
        },
      ],
      "id": "3",
      "type": "code_line_v2_code",
    }
  `);

  resetChanges(controller, [old, [2, 0]], [newElement, [2, 0]]);

  expect(controller.children[2].children[0].children[1]).toMatchInlineSnapshot(`
    {
      "children": [
        {
          "text": "100",
        },
      ],
      "id": "3",
      "type": "code_line_v2_code",
    }
  `);
});

it('resets to old node with smart refs', () => {
  const newSmartRef: SmartRefElement = {
    id: 'smart-ref',
    type: 'smart-ref',
    columnId: null,
    blockId: 'block-id',
    children: [{ text: '' }],
  };

  const newElement: CodeLineV2Element = {
    type: 'code_line_v2',
    id: '1',
    children: [
      {
        type: 'structured_varname',
        id: '2',
        children: [{ text: 'varname' }],
      },
      {
        type: 'code_line_v2_code',
        id: '3',
        children: [{ text: '100' }, newSmartRef],
      },
    ],
  };

  controller.apply({
    type: 'remove_node',
    path: [2, 0],
    node: old,
  });

  controller.withoutNormalizing(() => {
    controller.apply({
      type: 'insert_node',
      path: [2, 0],
      node: newElement,
    });
  });

  expect(controller.children[2].children[0].children[1]).toMatchInlineSnapshot(`
    {
      "children": [
        {
          "text": "100",
        },
        {
          "blockId": "block-id",
          "children": [
            {
              "text": "",
            },
          ],
          "columnId": null,
          "id": "smart-ref",
          "type": "smart-ref",
        },
        {
          "text": "",
        },
      ],
      "id": "3",
      "type": "code_line_v2_code",
    }
  `);

  resetChanges(controller, [old, [2, 0]], [newElement, [2, 0]]);

  expect(controller.children[2].children[0].children[1]).toMatchInlineSnapshot(`
    {
      "children": [
        {
          "text": "100",
        },
      ],
      "id": "3",
      "type": "code_line_v2_code",
    }
  `);
});
