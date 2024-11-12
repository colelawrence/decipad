/* eslint-disable prefer-destructuring */
import { EditorController } from '@decipad/notebook-tabs';
import { describe, it, expect, beforeEach } from 'vitest';
import { controllerProxy, controllerReverseProxy } from './controller-proxy';
import { createPlateEditor } from '@udecode/plate-common';
import { CREATING_VARIABLE_INITIAL_VALUE } from './editor';
import { ELEMENT_DATA_TAB_CHILDREN } from '@decipad/editor-types';

describe('Proxy from data-drawer -> controller', () => {
  let controller = new EditorController('id', []);

  beforeEach(() => {
    controller = new EditorController('id', []);
    controller.forceNormalize();
  });

  it('Correctly proxies to controller in data tab', () => {
    controller.apply({
      type: 'insert_node',
      node: {
        id: '1',
        type: ELEMENT_DATA_TAB_CHILDREN,
        children: [],
      } as any,
      path: [1, 0],
    });

    const proxied = controllerProxy(controller, '1');
    proxied({
      type: 'insert_node',
      node: { id: '2', type: ELEMENT_DATA_TAB_CHILDREN, children: [] } as any,
      path: [0],
    });

    expect(controller.children[1].children).toMatchInlineSnapshot(`
      [
        {
          "children": [],
          "id": "2",
          "type": "data-tab-children",
        },
        {
          "children": [],
          "id": "1",
          "type": "data-tab-children",
        },
      ]
    `);
  });

  it('Correctly proxies to controller in other tabs', () => {
    controller.apply({
      type: 'insert_node',
      node: {
        id: '1',
        type: 'type',
        children: [],
      } as any,
      path: [2, 0],
    });

    const proxied = controllerProxy(controller, '1');
    proxied({
      type: 'insert_node',
      node: { id: '2', children: [] } as any,
      path: [0],
    });

    expect(controller.children[2].children).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "text": "",
          },
        ],
        "id": "2",
      },
      {
        "children": [
          {
            "text": "",
          },
        ],
        "id": "1",
        "type": "type",
      },
      {
        "children": [
          {
            "text": "",
          },
        ],
        "type": "p",
      },
    ]
  `);
  });

  it('proxies even if the element moves in the meantime', () => {
    controller.apply({
      type: 'insert_node',
      node: {
        id: '1',
        children: [{ text: '' }],
      } as any,
      path: [2, 0],
    });

    const proxied = controllerProxy(controller, '1');

    //
    // Let's insert a block above the one we are targetting.
    // Because that will change it's path.
    //

    controller.apply({
      type: 'insert_node',
      node: {
        id: 'above-the-one-we-want',
        children: [{ text: '' }],
      } as any,
      path: [2, 0],
    });

    proxied({
      type: 'insert_text',
      text: 'this text should go into correct id',
      offset: 0,
      path: [0, 0],
    });

    expect(controller.children[2].children).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "text": "",
          },
        ],
        "id": "above-the-one-we-want",
      },
      {
        "children": [
          {
            "text": "this text should go into correct id",
          },
        ],
        "id": "1",
      },
      {
        "children": [
          {
            "text": "",
          },
        ],
        "type": "p",
      },
    ]
  `);
  });
});

describe('Proxy between controller -> data-drawer', () => {
  let controller = new EditorController('id', []);

  beforeEach(() => {
    controller = new EditorController('id', []);
    controller.forceNormalize();
  });

  it('proxies changes from the controller to the data drawer', () => {
    const INITIAL_NODE = {
      id: '1',
      children: [{ text: 'proxied' }],
    };

    controller.apply({
      type: 'insert_node',
      node: INITIAL_NODE as any,
      path: [2, 0],
    });

    const dataDrawerEditor = createPlateEditor({
      disableCorePlugins: { react: true },
    });

    dataDrawerEditor.apply({
      type: 'insert_node',
      node: INITIAL_NODE as any,
      path: [0],
    });

    controllerReverseProxy(controller, dataDrawerEditor, '1');

    controller.apply({
      type: 'insert_text',
      offset: 0,
      text: 'something ',
      path: [2, 0, 0],
    });

    expect(dataDrawerEditor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "text": "something proxied",
            },
          ],
          "id": "1",
        },
      ]
    `);
  });

  it('proxies more complex elements', () => {
    controller.apply({
      type: 'insert_node',
      node: CREATING_VARIABLE_INITIAL_VALUE[0] as any,
      path: [2, 0],
    });

    const dataDrawerEditor = createPlateEditor({
      disableCorePlugins: { react: true },
    });

    dataDrawerEditor.children = CREATING_VARIABLE_INITIAL_VALUE;

    controllerReverseProxy(
      controller,
      dataDrawerEditor,
      CREATING_VARIABLE_INITIAL_VALUE[0].id!
    );

    controller.apply({
      type: 'insert_text',
      offset: 0,
      text: 'adding to var_name',
      path: [2, 0, 0, 0],
    });

    controller.apply({
      type: 'insert_text',
      offset: 0,
      text: 'adding to code',
      path: [2, 0, 1, 0],
    });

    controller.apply({
      type: 'insert_node',
      node: {
        something: true,
        text: 'extra_leaf_node',
      },
      path: [2, 0, 1, 1],
    });

    expect(dataDrawerEditor.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                text: 'adding to var_name',
              },
            ],
            type: 'structured_varname',
          },
          {
            children: [
              {
                text: 'adding to code',
              },
              {
                something: true,
                text: 'extra_leaf_node',
              },
            ],
            type: 'code_line_v2_code',
          },
        ],
        type: 'code_line_v2',
      },
    ]);

    controller.apply({
      type: 'remove_node',
      node: (dataDrawerEditor.children[0].children[1].children as any)[0],
      path: [2, 0, 1, 0],
    });

    expect(dataDrawerEditor.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                text: 'adding to var_name',
              },
            ],
            type: 'structured_varname',
          },
          {
            children: [
              {
                something: true,
                text: 'extra_leaf_node',
              },
            ],
            type: 'code_line_v2_code',
          },
        ],
        type: 'code_line_v2',
      },
    ]);
  });

  it('proxies from elements that arent 0 path', () => {
    const PROXY_NODE = {
      id: '2',
      children: [{ text: 'proxied' }],
    };

    controller.apply({
      type: 'insert_node',
      node: {
        id: '1',
        children: [{ text: '' }],
      } as any,
      path: [2, 0],
    });

    controller.apply({
      type: 'insert_node',
      node: PROXY_NODE as any,
      path: [2, 1],
    });

    const dataDrawerEditor = createPlateEditor({
      disableCorePlugins: { react: true },
    });

    dataDrawerEditor.children = [PROXY_NODE] as any;

    controllerReverseProxy(controller, dataDrawerEditor, '2');

    controller.apply({
      type: 'insert_text',
      path: [2, 1, 0],
      offset: 0,
      text: 'op-',
    });

    expect(dataDrawerEditor.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "text": "op-proxied",
            },
          ],
          "id": "2",
        },
      ]
    `);
  });
});

it.todo('elements inside columns.');
