/* eslint-disable jest/no-standalone-expect */
import { testWithSandbox as test } from '../../../backend-test-sandbox/src';
import { notebookAssistant } from '../notebookAssistant/notebookAssistant';
import { setupTest } from './_setupTest';
import document from './__fixtures__/simple-with-ui-components.json';
import { Document } from '@decipad/editor-types';

test('notebook assistant: tables', async (ctx) => {
  let newNotebookId: string;
  setupTest(ctx, document as Document, ({ notebookId }) => {
    newNotebookId = notebookId;
  });

  it('can add a table', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'create another table with two columns and 3 rows'
    );

    expect(results).toMatchObject([
      {
        node: {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      text: 'Table2',
                    },
                  ],
                  id: expect.any(String),
                  type: 'table-var-name',
                },
              ],
              id: expect.any(String),
              type: 'table-caption',
            },
            {
              children: [
                {
                  cellType: {
                    kind: 'anything',
                  },
                  children: [
                    {
                      text: 'Column1',
                    },
                  ],
                  id: expect.any(String),
                  type: 'th',
                },
                {
                  cellType: {
                    kind: 'anything',
                  },
                  children: [
                    {
                      text: 'Column2',
                    },
                  ],
                  id: expect.any(String),
                  type: 'th',
                },
              ],
              id: expect.any(String),
              type: 'tr',
            },
            {
              children: [
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  id: expect.any(String),
                  type: 'td',
                },
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  id: expect.any(String),
                  type: 'td',
                },
              ],
              id: expect.any(String),
              type: 'tr',
            },
            {
              children: [
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  id: expect.any(String),
                  type: 'td',
                },
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  id: expect.any(String),
                  type: 'td',
                },
              ],
              id: expect.any(String),
              type: 'tr',
            },
            {
              children: [
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  id: expect.any(String),
                  type: 'td',
                },
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  id: expect.any(String),
                  type: 'td',
                },
              ],
              id: expect.any(String),
              type: 'tr',
            },
          ],
          id: expect.any(String),
          type: 'table',
        },
        path: [8],
        type: 'insert_node',
      },
    ]);
  }, 480000);

  it('can change the variable name of a table', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the table variable name to be "MyTableName"'
    );

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "text": "Table1",
          },
          "path": [
            5,
            0,
            0,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "Table1",
              },
            ],
            "id": "ek3093490dkwdkjsakdjksc",
            "type": "table-var-name",
          },
          "path": [
            5,
            0,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "MyTableName",
              },
            ],
            "id": "ek3093490dkwdkjsakdjksc",
            "type": "table-var-name",
          },
          "path": [
            5,
            0,
            0,
          ],
          "type": "insert_node",
        },
      ]
    `);
  }, 240000);

  it('can change a column name', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the table second column name to "MySecondColumn"'
    );

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "text": "Column2",
          },
          "path": [
            5,
            1,
            1,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "cellType": {
              "kind": "anything",
            },
            "children": [
              {
                "text": "Column2",
              },
            ],
            "id": "3jsjdf30ekdsa",
            "type": "th",
          },
          "path": [
            5,
            1,
            1,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "cellType": {
              "kind": "anything",
            },
            "children": [
              {
                "text": "MySecondColumn",
              },
            ],
            "id": "3jsjdf30ekdsa",
            "type": "th",
          },
          "path": [
            5,
            1,
            1,
          ],
          "type": "insert_node",
        },
      ]
    `);
  }, 240000);

  it('can add a column', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'add another column to the table'
    );

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "cellType": {
              "kind": "anything",
            },
            "children": [
              {
                "text": "Column3",
              },
            ],
            "id": "3jsjdf30ekdsa",
            "type": "th",
          },
          "path": [
            5,
            1,
            2,
          ],
          "type": "insert_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "fdsn3e9wdisadsaksaav",
            "type": "td",
          },
          "path": [
            5,
            2,
            2,
          ],
          "type": "insert_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "fsd3e93eidsakasdac",
            "type": "td",
          },
          "path": [
            5,
            3,
            2,
          ],
          "type": "insert_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "2edjwo3tywkfbr0hfewg3ejjokpok",
            "type": "td",
          },
          "path": [
            5,
            4,
            2,
          ],
          "type": "insert_node",
        },
      ]
    `);
  }, 240000);

  it('can remove a column', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'remove the last column of the table'
    );

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "children": [
              {
                "children": [
                  {
                    "text": "",
                  },
                ],
                "id": "2ejdj3dj32d923dj",
                "type": "td",
              },
              {
                "children": [
                  {
                    "text": "",
                  },
                ],
                "id": "2edjwo3tywkfbr0hfewg3ejjokpok",
                "type": "td",
              },
            ],
            "id": "3edjed039ic9didicvkk",
            "type": "tr",
          },
          "path": [
            5,
            4,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "cellType": {
              "kind": "anything",
            },
            "children": [
              {
                "text": "Column2",
              },
            ],
            "id": "3jsjdf30ekdsa",
            "type": "th",
          },
          "path": [
            5,
            1,
            1,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "fdsn3e9wdisadsaksaav",
            "type": "td",
          },
          "path": [
            5,
            2,
            1,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "",
              },
            ],
            "id": "fsd3e93eidsakasdac",
            "type": "td",
          },
          "path": [
            5,
            3,
            1,
          ],
          "type": "remove_node",
        },
      ]
    `);
  }, 240000);

  it('can change the type of a column', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the type of the second column to number'
    );

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "newProperties": {
            "cellType": {
              "kind": "number",
            },
          },
          "node": {
            "cellType": {
              "kind": "anything",
            },
            "children": [
              {
                "text": "Column2",
              },
            ],
            "id": "3jsjdf30ekdsa",
            "type": "th",
          },
          "path": [
            5,
            1,
            1,
          ],
          "properties": {
            "cellType": {
              "kind": "anything",
            },
          },
          "type": "set_node",
        },
      ]
    `);
  }, 240000);

  it('can fill a column with sequential numbers', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'fill the first column of the existing table with numbers from 10 to 14, adding extra rows if needed'
    );

    expect(results).toMatchObject([
      {
        node: {
          children: [
            {
              text: '',
            },
          ],
          id: 'dsj309eskcdasklassmc',
          type: 'td',
        },
        path: [5, 2, 0],
        type: 'remove_node',
      },
      {
        node: {
          children: [
            {
              text: '',
            },
          ],
          id: 'fd3e939dsaksd023od',
          type: 'td',
        },
        path: [5, 3, 0],
        type: 'remove_node',
      },
      {
        node: {
          children: [
            {
              text: '',
            },
          ],
          id: '2ejdj3dj32d923dj',
          type: 'td',
        },
        path: [5, 4, 0],
        type: 'remove_node',
      },
      {
        node: {
          children: [
            {
              text: '10',
            },
          ],
          id: 'dsj309eskcdasklassmc',
          type: 'td',
        },
        path: [5, 2, 0],
        type: 'insert_node',
      },
      {
        node: {
          children: [
            {
              text: '11',
            },
          ],
          id: 'fd3e939dsaksd023od',
          type: 'td',
        },
        path: [5, 3, 0],
        type: 'insert_node',
      },
      {
        node: {
          children: [
            {
              text: '12',
            },
          ],
          id: '2ejdj3dj32d923dj',
          type: 'td',
        },
        path: [5, 4, 0],
        type: 'insert_node',
      },
      {
        node: {
          children: [
            {
              children: [
                {
                  text: '13',
                },
              ],
              id: expect.any(String),
              type: 'td',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              id: expect.any(String),
              type: 'td',
            },
          ],
          id: '3edjed039ic9didicvkk',
          type: 'tr',
        },
        path: [5, 5],
        type: 'insert_node',
      },
      {
        node: {
          children: [
            {
              children: [
                {
                  text: '14',
                },
              ],
              id: expect.any(String),
              type: 'td',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              id: '2edjwo3tywkfbr0hfewg3ejjokpok',
              type: 'td',
            },
          ],
          id: '3edjed039ic9didicvkk',
          type: 'tr',
        },
        path: [5, 6],
        type: 'insert_node',
      },
    ]);
  }, 240000);

  it('can fill a column with pokemon names', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'fill the second column of the existing table with 10 Pokemon names'
    );

    expect(results).toMatchObject([
      {
        node: {
          children: [
            {
              text: '',
            },
          ],
          id: 'dsj309eskcdasklassmc',
          type: 'td',
        },
        path: [5, 2, 0],
        type: 'remove_node',
      },
      {
        node: {
          children: [
            {
              text: '',
            },
          ],
          id: 'fd3e939dsaksd023od',
          type: 'td',
        },
        path: [5, 3, 0],
        type: 'remove_node',
      },
      {
        node: {
          children: [
            {
              text: '',
            },
          ],
          id: '2ejdj3dj32d923dj',
          type: 'td',
        },
        path: [5, 4, 0],
        type: 'remove_node',
      },
      {
        node: {
          children: [
            {
              text: expect.stringMatching(
                /Pikachu|Bulbasaur|Charizard|Mewtwo|Squirtle/
              ),
            },
          ],
          id: 'dsj309eskcdasklassmc',
          type: 'td',
        },
        path: [5, 2, 0],
        type: 'insert_node',
      },
      {
        node: {
          children: [
            {
              text: '',
            },
          ],
          id: 'fdsn3e9wdisadsaksaav',
          type: 'td',
        },
        path: [5, 2, 1],
        type: 'remove_node',
      },
      {
        node: {
          children: [
            {
              text: expect.stringMatching(
                /Pikachu|Bulbasaur|Charizard|Mewtwo|Squirtle/
              ),
            },
          ],
          id: 'fdsn3e9wdisadsaksaav',
          type: 'td',
        },
        path: [5, 2, 1],
        type: 'insert_node',
      },
      {
        node: {
          children: [
            {
              text: expect.stringMatching(
                /Pikachu|Bulbasaur|Charizard|Mewtwo|Squirtle/
              ),
            },
          ],
          id: 'fd3e939dsaksd023od',
          type: 'td',
        },
        path: [5, 3, 0],
        type: 'insert_node',
      },
      {
        node: {
          children: [
            {
              text: '',
            },
          ],
          id: 'fsd3e93eidsakasdac',
          type: 'td',
        },
        path: [5, 3, 1],
        type: 'remove_node',
      },
      {
        node: {
          children: [
            {
              text: expect.stringMatching(
                /Pikachu|Bulbasaur|Charizard|Mewtwo|Squirtle/
              ),
            },
          ],
          id: 'fsd3e93eidsakasdac',
          type: 'td',
        },
        path: [5, 3, 1],
        type: 'insert_node',
      },
      {
        node: {
          children: [
            {
              text: 'Jigglypuff',
            },
          ],
          id: '2ejdj3dj32d923dj',
          type: 'td',
        },
        path: [5, 4, 0],
        type: 'insert_node',
      },
      {
        node: {
          children: [
            {
              text: '',
            },
          ],
          id: '2edjwo3tywkfbr0hfewg3ejjokpok',
          type: 'td',
        },
        path: [5, 4, 1],
        type: 'remove_node',
      },
      {
        node: {
          children: [
            {
              text: expect.stringMatching(
                /Pikachu|Bulbasaur|Charizard|Mewtwo|Squirtle/
              ),
            },
          ],
          id: '2edjwo3tywkfbr0hfewg3ejjokpok',
          type: 'td',
        },
        path: [5, 4, 1],
        type: 'insert_node',
      },
    ]);
  }, 240000);
});
