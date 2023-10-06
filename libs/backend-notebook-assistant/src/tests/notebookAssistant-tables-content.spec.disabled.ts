/* eslint-disable jest/no-standalone-expect */
import { Document } from '@decipad/editor-types';
import { testWithSandbox as test } from '../../../backend-test-sandbox/src';
import { notebookAssistant } from '../notebookAssistant/notebookAssistant';
import { setupTest } from './_setupTest';
import _document from './__fixtures__/simple-with-ui-components.json';
import { applyOperations } from '../utils/applyOperations';

const document = _document as Document;

test('notebook assistant: tables', async (ctx) => {
  let newNotebookId: string;
  setupTest(ctx, document, ({ notebookId }) => {
    newNotebookId = notebookId;
  });

  it('can add a table', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'create another table with two columns and 3 rows'
    );

    expect(applyOperations(document, results)).toMatchObject([
      {
        children: [
          {
            text: '🕯Starting a Candle Business',
          },
        ],
        id: '3JTr-B84cKMnNOYnvHiFi',
        type: 'h1',
      },
      {
        children: [
          {
            text: 'During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!',
          },
        ],
        id: '18YPGVFcBkSie3WopWDlo',
        type: 'p',
      },
      {
        children: [
          {
            highlight: true,
            text: 'It looks like I could make a profit ',
          },
          {
            text: 'and some side income based on my assumptions below. Feedback welcome!',
          },
        ],
        id: 'ngIq_tCJClGugubOIsRKT',
        type: 'p',
      },
      {
        children: [
          {
            children: [
              {
                text: 'nameoftheslider',
              },
            ],
            id: '-igGVqsXaHA80joO1eFUm',
            type: 'caption',
          },
          {
            children: [
              {
                text: '5',
              },
            ],
            id: 'C4SzMPEnqrsKwTNJhL5vu',
            type: 'exp',
          },
          {
            children: [
              {
                text: '',
              },
            ],
            id: '5MhvUPKXijpZV9AwLW4Cs',
            max: '10',
            min: '0',
            step: '1',
            type: 'slider',
            value: '5',
          },
        ],
        id: 'QeyklnGhr7iEZvZ1ntElO',
        type: 'def',
        variant: 'slider',
      },
      {
        children: [
          {
            highlight: true,
            text: 'It looks like I could make a profit ',
          },
          {
            text: 'and some side income based on my assumptions below. Feedback welcome!',
          },
        ],
        id: 'ngIq_tCJClGugubOIsRKT',
        type: 'p',
      },
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: 'Table1',
                  },
                ],
                id: 'ek3093490dkwdkjsakdjksc',
                type: 'table-var-name',
              },
            ],
            id: 'fdfskljdslk3erwlk',
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
                id: 'fdsk3re3ejdsakfdsfss',
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
                id: '3jsjdf30ekdsa',
                type: 'th',
              },
            ],
            id: 'fdskrew034ksdfsk',
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
                id: 'dsj309eskcdasklassmc',
                type: 'td',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'fdsn3e9wdisadsaksaav',
                type: 'td',
              },
            ],
            id: 'fj3e93eidskdsadffcc',
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
                id: 'fd3e939dsaksd023od',
                type: 'td',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                id: 'fsd3e93eidsakasdac',
                type: 'td',
              },
            ],
            id: '2e9dw934eksd230e23r9kcr39cmgt',
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
                id: '2ejdj3dj32d923dj',
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
        ],
        id: '2wr03rifdsk30rfsd',
        type: 'table',
      },
      {
        children: [
          {
            text: '🎯 What about marketing?',
          },
        ],
        id: 'xHCDeKqDxpFqJxDAdXjDI',
        type: 'h2',
      },
      {
        children: [
          {
            text: 'What percentage of my net revenue ',
          },
          {
            italic: true,
            text: '(before expenses)',
          },
          {
            text: ' would I allocate to marketing initiatives? ',
          },
        ],
        id: 'n2uD1VwAOCMN1FQOMngPv',
        type: 'p',
      },
      {
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
            id: 'newRow2Id',
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
    ]);
  }, 480000);

  it('can change the variable name of a table', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the table variable name to be "MyTableName"'
    );

    expect(applyOperations(document, results)).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "text": "🕯Starting a Candle Business",
            },
          ],
          "id": "3JTr-B84cKMnNOYnvHiFi",
          "type": "h1",
        },
        {
          "children": [
            {
              "text": "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
            },
          ],
          "id": "18YPGVFcBkSie3WopWDlo",
          "type": "p",
        },
        {
          "children": [
            {
              "highlight": true,
              "text": "It looks like I could make a profit ",
            },
            {
              "text": "and some side income based on my assumptions below. Feedback welcome!",
            },
          ],
          "id": "ngIq_tCJClGugubOIsRKT",
          "type": "p",
        },
        {
          "children": [
            {
              "children": [
                {
                  "text": "nameoftheslider",
                },
              ],
              "id": "-igGVqsXaHA80joO1eFUm",
              "type": "caption",
            },
            {
              "children": [
                {
                  "text": "5",
                },
              ],
              "id": "C4SzMPEnqrsKwTNJhL5vu",
              "type": "exp",
            },
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "id": "5MhvUPKXijpZV9AwLW4Cs",
              "max": "10",
              "min": "0",
              "step": "1",
              "type": "slider",
              "value": "5",
            },
          ],
          "id": "QeyklnGhr7iEZvZ1ntElO",
          "type": "def",
          "variant": "slider",
        },
        {
          "children": [
            {
              "highlight": true,
              "text": "It looks like I could make a profit ",
            },
            {
              "text": "and some side income based on my assumptions below. Feedback welcome!",
            },
          ],
          "id": "ngIq_tCJClGugubOIsRKT",
          "type": "p",
        },
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "MyTableName",
                    },
                  ],
                  "id": "ek3093490dkwdkjsakdjksc",
                  "type": "table-var-name",
                },
              ],
              "id": "fdfskljdslk3erwlk",
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "anything",
                  },
                  "children": [
                    {
                      "text": "Column1",
                    },
                  ],
                  "id": "fdsk3re3ejdsakfdsfss",
                  "type": "th",
                },
                {
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
              ],
              "id": "fdskrew034ksdfsk",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "dsj309eskcdasklassmc",
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fdsn3e9wdisadsaksaav",
                  "type": "td",
                },
              ],
              "id": "fj3e93eidskdsadffcc",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fd3e939dsaksd023od",
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fsd3e93eidsakasdac",
                  "type": "td",
                },
              ],
              "id": "2e9dw934eksd230e23r9kcr39cmgt",
              "type": "tr",
            },
            {
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
          ],
          "id": "2wr03rifdsk30rfsd",
          "type": "table",
        },
        {
          "children": [
            {
              "text": "🎯 What about marketing?",
            },
          ],
          "id": "xHCDeKqDxpFqJxDAdXjDI",
          "type": "h2",
        },
        {
          "children": [
            {
              "text": "What percentage of my net revenue ",
            },
            {
              "italic": true,
              "text": "(before expenses)",
            },
            {
              "text": " would I allocate to marketing initiatives? ",
            },
          ],
          "id": "n2uD1VwAOCMN1FQOMngPv",
          "type": "p",
        },
      ]
    `);
  }, 240000);

  it('can change a column name', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the table second column name to "MySecondColumn"'
    );

    expect(applyOperations(document, results)).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "text": "🕯Starting a Candle Business",
            },
          ],
          "id": "3JTr-B84cKMnNOYnvHiFi",
          "type": "h1",
        },
        {
          "children": [
            {
              "text": "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
            },
          ],
          "id": "18YPGVFcBkSie3WopWDlo",
          "type": "p",
        },
        {
          "children": [
            {
              "highlight": true,
              "text": "It looks like I could make a profit ",
            },
            {
              "text": "and some side income based on my assumptions below. Feedback welcome!",
            },
          ],
          "id": "ngIq_tCJClGugubOIsRKT",
          "type": "p",
        },
        {
          "children": [
            {
              "children": [
                {
                  "text": "nameoftheslider",
                },
              ],
              "id": "-igGVqsXaHA80joO1eFUm",
              "type": "caption",
            },
            {
              "children": [
                {
                  "text": "5",
                },
              ],
              "id": "C4SzMPEnqrsKwTNJhL5vu",
              "type": "exp",
            },
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "id": "5MhvUPKXijpZV9AwLW4Cs",
              "max": "10",
              "min": "0",
              "step": "1",
              "type": "slider",
              "value": "5",
            },
          ],
          "id": "QeyklnGhr7iEZvZ1ntElO",
          "type": "def",
          "variant": "slider",
        },
        {
          "children": [
            {
              "highlight": true,
              "text": "It looks like I could make a profit ",
            },
            {
              "text": "and some side income based on my assumptions below. Feedback welcome!",
            },
          ],
          "id": "ngIq_tCJClGugubOIsRKT",
          "type": "p",
        },
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "Table1",
                    },
                  ],
                  "id": "ek3093490dkwdkjsakdjksc",
                  "type": "table-var-name",
                },
              ],
              "id": "fdfskljdslk3erwlk",
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "anything",
                  },
                  "children": [
                    {
                      "text": "Column1",
                    },
                  ],
                  "id": "fdsk3re3ejdsakfdsfss",
                  "type": "th",
                },
                {
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
              ],
              "id": "fdskrew034ksdfsk",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "dsj309eskcdasklassmc",
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fdsn3e9wdisadsaksaav",
                  "type": "td",
                },
              ],
              "id": "fj3e93eidskdsadffcc",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fd3e939dsaksd023od",
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fsd3e93eidsakasdac",
                  "type": "td",
                },
              ],
              "id": "2e9dw934eksd230e23r9kcr39cmgt",
              "type": "tr",
            },
            {
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
          ],
          "id": "2wr03rifdsk30rfsd",
          "type": "table",
        },
        {
          "children": [
            {
              "text": "🎯 What about marketing?",
            },
          ],
          "id": "xHCDeKqDxpFqJxDAdXjDI",
          "type": "h2",
        },
        {
          "children": [
            {
              "text": "What percentage of my net revenue ",
            },
            {
              "italic": true,
              "text": "(before expenses)",
            },
            {
              "text": " would I allocate to marketing initiatives? ",
            },
          ],
          "id": "n2uD1VwAOCMN1FQOMngPv",
          "type": "p",
        },
      ]
    `);
  }, 240000);

  it('can add a column', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'add another column to the table'
    );

    expect(applyOperations(document, results)).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "text": "🕯Starting a Candle Business",
            },
          ],
          "id": "3JTr-B84cKMnNOYnvHiFi",
          "type": "h1",
        },
        {
          "children": [
            {
              "text": "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
            },
          ],
          "id": "18YPGVFcBkSie3WopWDlo",
          "type": "p",
        },
        {
          "children": [
            {
              "highlight": true,
              "text": "It looks like I could make a profit ",
            },
            {
              "text": "and some side income based on my assumptions below. Feedback welcome!",
            },
          ],
          "id": "ngIq_tCJClGugubOIsRKT",
          "type": "p",
        },
        {
          "children": [
            {
              "children": [
                {
                  "text": "nameoftheslider",
                },
              ],
              "id": "-igGVqsXaHA80joO1eFUm",
              "type": "caption",
            },
            {
              "children": [
                {
                  "text": "5",
                },
              ],
              "id": "C4SzMPEnqrsKwTNJhL5vu",
              "type": "exp",
            },
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "id": "5MhvUPKXijpZV9AwLW4Cs",
              "max": "10",
              "min": "0",
              "step": "1",
              "type": "slider",
              "value": "5",
            },
          ],
          "id": "QeyklnGhr7iEZvZ1ntElO",
          "type": "def",
          "variant": "slider",
        },
        {
          "children": [
            {
              "highlight": true,
              "text": "It looks like I could make a profit ",
            },
            {
              "text": "and some side income based on my assumptions below. Feedback welcome!",
            },
          ],
          "id": "ngIq_tCJClGugubOIsRKT",
          "type": "p",
        },
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "Table1",
                    },
                  ],
                  "id": "ek3093490dkwdkjsakdjksc",
                  "type": "table-var-name",
                },
              ],
              "id": "fdfskljdslk3erwlk",
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "anything",
                  },
                  "children": [
                    {
                      "text": "Column1",
                    },
                  ],
                  "id": "fdsk3re3ejdsakfdsfss",
                  "type": "th",
                },
                {
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
                {
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
              ],
              "id": "fdskrew034ksdfsk",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "dsj309eskcdasklassmc",
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fdsn3e9wdisadsaksaav",
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fdsn3e9wdisadsaksaav",
                  "type": "td",
                },
              ],
              "id": "fj3e93eidskdsadffcc",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fd3e939dsaksd023od",
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fsd3e93eidsakasdac",
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fsd3e93eidsakasdac",
                  "type": "td",
                },
              ],
              "id": "2e9dw934eksd230e23r9kcr39cmgt",
              "type": "tr",
            },
            {
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
          ],
          "id": "2wr03rifdsk30rfsd",
          "type": "table",
        },
        {
          "children": [
            {
              "text": "🎯 What about marketing?",
            },
          ],
          "id": "xHCDeKqDxpFqJxDAdXjDI",
          "type": "h2",
        },
        {
          "children": [
            {
              "text": "What percentage of my net revenue ",
            },
            {
              "italic": true,
              "text": "(before expenses)",
            },
            {
              "text": " would I allocate to marketing initiatives? ",
            },
          ],
          "id": "n2uD1VwAOCMN1FQOMngPv",
          "type": "p",
        },
      ]
    `);
  }, 240000);

  it('can remove a column', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'remove the last column of the table'
    );

    expect(applyOperations(document, results)).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "text": "🕯Starting a Candle Business",
            },
          ],
          "id": "3JTr-B84cKMnNOYnvHiFi",
          "type": "h1",
        },
        {
          "children": [
            {
              "text": "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
            },
          ],
          "id": "18YPGVFcBkSie3WopWDlo",
          "type": "p",
        },
        {
          "children": [
            {
              "highlight": true,
              "text": "It looks like I could make a profit ",
            },
            {
              "text": "and some side income based on my assumptions below. Feedback welcome!",
            },
          ],
          "id": "ngIq_tCJClGugubOIsRKT",
          "type": "p",
        },
        {
          "children": [
            {
              "children": [
                {
                  "text": "nameoftheslider",
                },
              ],
              "id": "-igGVqsXaHA80joO1eFUm",
              "type": "caption",
            },
            {
              "children": [
                {
                  "text": "5",
                },
              ],
              "id": "C4SzMPEnqrsKwTNJhL5vu",
              "type": "exp",
            },
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "id": "5MhvUPKXijpZV9AwLW4Cs",
              "max": "10",
              "min": "0",
              "step": "1",
              "type": "slider",
              "value": "5",
            },
          ],
          "id": "QeyklnGhr7iEZvZ1ntElO",
          "type": "def",
          "variant": "slider",
        },
        {
          "children": [
            {
              "highlight": true,
              "text": "It looks like I could make a profit ",
            },
            {
              "text": "and some side income based on my assumptions below. Feedback welcome!",
            },
          ],
          "id": "ngIq_tCJClGugubOIsRKT",
          "type": "p",
        },
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "Table1",
                    },
                  ],
                  "id": "ek3093490dkwdkjsakdjksc",
                  "type": "table-var-name",
                },
              ],
              "id": "fdfskljdslk3erwlk",
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "anything",
                  },
                  "children": [
                    {
                      "text": "Column1",
                    },
                  ],
                  "id": "fdsk3re3ejdsakfdsfss",
                  "type": "th",
                },
              ],
              "id": "fdskrew034ksdfsk",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "dsj309eskcdasklassmc",
                  "type": "td",
                },
              ],
              "id": "fj3e93eidskdsadffcc",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fd3e939dsaksd023od",
                  "type": "td",
                },
              ],
              "id": "2e9dw934eksd230e23r9kcr39cmgt",
              "type": "tr",
            },
          ],
          "id": "2wr03rifdsk30rfsd",
          "type": "table",
        },
        {
          "children": [
            {
              "text": "🎯 What about marketing?",
            },
          ],
          "id": "xHCDeKqDxpFqJxDAdXjDI",
          "type": "h2",
        },
        {
          "children": [
            {
              "text": "What percentage of my net revenue ",
            },
            {
              "italic": true,
              "text": "(before expenses)",
            },
            {
              "text": " would I allocate to marketing initiatives? ",
            },
          ],
          "id": "n2uD1VwAOCMN1FQOMngPv",
          "type": "p",
        },
      ]
    `);
  }, 240000);

  it('can change the type of a column', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the type of the second column to number'
    );

    expect(applyOperations(document, results)).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "text": "🕯Starting a Candle Business",
            },
          ],
          "id": "3JTr-B84cKMnNOYnvHiFi",
          "type": "h1",
        },
        {
          "children": [
            {
              "text": "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
            },
          ],
          "id": "18YPGVFcBkSie3WopWDlo",
          "type": "p",
        },
        {
          "children": [
            {
              "highlight": true,
              "text": "It looks like I could make a profit ",
            },
            {
              "text": "and some side income based on my assumptions below. Feedback welcome!",
            },
          ],
          "id": "ngIq_tCJClGugubOIsRKT",
          "type": "p",
        },
        {
          "children": [
            {
              "children": [
                {
                  "text": "nameoftheslider",
                },
              ],
              "id": "-igGVqsXaHA80joO1eFUm",
              "type": "caption",
            },
            {
              "children": [
                {
                  "text": "5",
                },
              ],
              "id": "C4SzMPEnqrsKwTNJhL5vu",
              "type": "exp",
            },
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "id": "5MhvUPKXijpZV9AwLW4Cs",
              "max": "10",
              "min": "0",
              "step": "1",
              "type": "slider",
              "value": "5",
            },
          ],
          "id": "QeyklnGhr7iEZvZ1ntElO",
          "type": "def",
          "variant": "slider",
        },
        {
          "children": [
            {
              "highlight": true,
              "text": "It looks like I could make a profit ",
            },
            {
              "text": "and some side income based on my assumptions below. Feedback welcome!",
            },
          ],
          "id": "ngIq_tCJClGugubOIsRKT",
          "type": "p",
        },
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "Table1",
                    },
                  ],
                  "id": "ek3093490dkwdkjsakdjksc",
                  "type": "table-var-name",
                },
              ],
              "id": "fdfskljdslk3erwlk",
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "anything",
                  },
                  "children": [
                    {
                      "text": "Column1",
                    },
                  ],
                  "id": "fdsk3re3ejdsakfdsfss",
                  "type": "th",
                },
                {
                  "cellType": {
                    "kind": "number",
                  },
                  "children": [
                    {
                      "text": "Column2",
                    },
                  ],
                  "id": "3jsjdf30ekdsa",
                  "type": "th",
                },
              ],
              "id": "fdskrew034ksdfsk",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "dsj309eskcdasklassmc",
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fdsn3e9wdisadsaksaav",
                  "type": "td",
                },
              ],
              "id": "fj3e93eidskdsadffcc",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fd3e939dsaksd023od",
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fsd3e93eidsakasdac",
                  "type": "td",
                },
              ],
              "id": "2e9dw934eksd230e23r9kcr39cmgt",
              "type": "tr",
            },
            {
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
          ],
          "id": "2wr03rifdsk30rfsd",
          "type": "table",
        },
        {
          "children": [
            {
              "text": "🎯 What about marketing?",
            },
          ],
          "id": "xHCDeKqDxpFqJxDAdXjDI",
          "type": "h2",
        },
        {
          "children": [
            {
              "text": "What percentage of my net revenue ",
            },
            {
              "italic": true,
              "text": "(before expenses)",
            },
            {
              "text": " would I allocate to marketing initiatives? ",
            },
          ],
          "id": "n2uD1VwAOCMN1FQOMngPv",
          "type": "p",
        },
      ]
    `);
  }, 240000);

  it('can fill a column with sequential numbers', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'fill the first column of the existing table with numbers from 10 to 14, adding extra rows if needed'
    );

    expect(applyOperations(document, results)).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "text": "🕯Starting a Candle Business",
            },
          ],
          "id": "3JTr-B84cKMnNOYnvHiFi",
          "type": "h1",
        },
        {
          "children": [
            {
              "text": "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
            },
          ],
          "id": "18YPGVFcBkSie3WopWDlo",
          "type": "p",
        },
        {
          "children": [
            {
              "highlight": true,
              "text": "It looks like I could make a profit ",
            },
            {
              "text": "and some side income based on my assumptions below. Feedback welcome!",
            },
          ],
          "id": "ngIq_tCJClGugubOIsRKT",
          "type": "p",
        },
        {
          "children": [
            {
              "children": [
                {
                  "text": "nameoftheslider",
                },
              ],
              "id": "-igGVqsXaHA80joO1eFUm",
              "type": "caption",
            },
            {
              "children": [
                {
                  "text": "5",
                },
              ],
              "id": "C4SzMPEnqrsKwTNJhL5vu",
              "type": "exp",
            },
            {
              "children": [
                {
                  "text": "",
                },
              ],
              "id": "5MhvUPKXijpZV9AwLW4Cs",
              "max": "10",
              "min": "0",
              "step": "1",
              "type": "slider",
              "value": "5",
            },
          ],
          "id": "QeyklnGhr7iEZvZ1ntElO",
          "type": "def",
          "variant": "slider",
        },
        {
          "children": [
            {
              "highlight": true,
              "text": "It looks like I could make a profit ",
            },
            {
              "text": "and some side income based on my assumptions below. Feedback welcome!",
            },
          ],
          "id": "ngIq_tCJClGugubOIsRKT",
          "type": "p",
        },
        {
          "children": [
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "Table1",
                    },
                  ],
                  "id": "ek3093490dkwdkjsakdjksc",
                  "type": "table-var-name",
                },
              ],
              "id": "fdfskljdslk3erwlk",
              "type": "table-caption",
            },
            {
              "children": [
                {
                  "cellType": {
                    "kind": "anything",
                  },
                  "children": [
                    {
                      "text": "Column1",
                    },
                  ],
                  "id": "fdsk3re3ejdsakfdsfss",
                  "type": "th",
                },
                {
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
              ],
              "id": "fdskrew034ksdfsk",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "10",
                    },
                  ],
                  "id": "dsj309eskcdasklassmc",
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fdsn3e9wdisadsaksaav",
                  "type": "td",
                },
              ],
              "id": "fj3e93eidskdsadffcc",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "11",
                    },
                  ],
                  "id": "fd3e939dsaksd023od",
                  "type": "td",
                },
                {
                  "children": [
                    {
                      "text": "",
                    },
                  ],
                  "id": "fsd3e93eidsakasdac",
                  "type": "td",
                },
              ],
              "id": "2e9dw934eksd230e23r9kcr39cmgt",
              "type": "tr",
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "12",
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
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "13",
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
            {
              "children": [
                {
                  "children": [
                    {
                      "text": "14",
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
          ],
          "id": "2wr03rifdsk30rfsd",
          "type": "table",
        },
        {
          "children": [
            {
              "text": "🎯 What about marketing?",
            },
          ],
          "id": "xHCDeKqDxpFqJxDAdXjDI",
          "type": "h2",
        },
        {
          "children": [
            {
              "text": "What percentage of my net revenue ",
            },
            {
              "italic": true,
              "text": "(before expenses)",
            },
            {
              "text": " would I allocate to marketing initiatives? ",
            },
          ],
          "id": "n2uD1VwAOCMN1FQOMngPv",
          "type": "p",
        },
      ]
    `);
  }, 240000);

  it('can fill a column with pokemon names', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'fill the second column of the existing table with 10 Pokemon names'
    );

    expect(applyOperations(document, results)).toMatchObject([
      {
        children: [
          {
            text: '🕯Starting a Candle Business',
          },
        ],
        id: '3JTr-B84cKMnNOYnvHiFi',
        type: 'h1',
      },
      {
        children: [
          {
            text: 'During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!',
          },
        ],
        id: '18YPGVFcBkSie3WopWDlo',
        type: 'p',
      },
      {
        children: [
          {
            highlight: true,
            text: 'It looks like I could make a profit ',
          },
          {
            text: 'and some side income based on my assumptions below. Feedback welcome!',
          },
        ],
        id: 'ngIq_tCJClGugubOIsRKT',
        type: 'p',
      },
      {
        children: [
          {
            children: [
              {
                text: 'nameoftheslider',
              },
            ],
            id: '-igGVqsXaHA80joO1eFUm',
            type: 'caption',
          },
          {
            children: [
              {
                text: '5',
              },
            ],
            id: 'C4SzMPEnqrsKwTNJhL5vu',
            type: 'exp',
          },
          {
            children: [
              {
                text: '',
              },
            ],
            id: '5MhvUPKXijpZV9AwLW4Cs',
            max: '10',
            min: '0',
            step: '1',
            type: 'slider',
            value: '5',
          },
        ],
        id: 'QeyklnGhr7iEZvZ1ntElO',
        type: 'def',
        variant: 'slider',
      },
      {
        children: [
          {
            highlight: true,
            text: 'It looks like I could make a profit ',
          },
          {
            text: 'and some side income based on my assumptions below. Feedback welcome!',
          },
        ],
        id: 'ngIq_tCJClGugubOIsRKT',
        type: 'p',
      },
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: 'Table1',
                  },
                ],
                id: 'ek3093490dkwdkjsakdjksc',
                type: 'table-var-name',
              },
            ],
            id: 'fdfskljdslk3erwlk',
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
                id: 'fdsk3re3ejdsakfdsfss',
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
                id: '3jsjdf30ekdsa',
                type: 'th',
              },
            ],
            id: 'fdskrew034ksdfsk',
            type: 'tr',
          },
          {
            children: [
              {
                children: [
                  {
                    text: expect.stringMatching(
                      /^Pikachu|Charizard|Bulbasaur|Squirtle|Jigglypuff|Mewtwo$/
                    ),
                  },
                ],
                id: 'dsj309eskcdasklassmc',
                type: 'td',
              },
              {
                children: [
                  {
                    text: expect.stringMatching(
                      /^Pikachu|Charizard|Bulbasaur|Squirtle|Jigglypuff|Mewtwo$/
                    ),
                  },
                ],
                id: 'fdsn3e9wdisadsaksaav',
                type: 'td',
              },
            ],
            id: 'fj3e93eidskdsadffcc',
            type: 'tr',
          },
          {
            children: [
              {
                children: [
                  {
                    text: expect.stringMatching(
                      /^Pokemon|Pikachu|Charizard|Bulbasaur|Squirtle|Jigglypuff|Mewtwo$/
                    ),
                  },
                ],
                id: 'fd3e939dsaksd023od',
                type: 'td',
              },
              {
                children: [
                  {
                    text: expect.stringMatching(
                      /^Pokemon|Pikachu|Charizard|Bulbasaur|Squirtle|Jigglypuff|Mewtwo$/
                    ),
                  },
                ],
                id: 'fsd3e93eidsakasdac',
                type: 'td',
              },
            ],
            id: '2e9dw934eksd230e23r9kcr39cmgt',
            type: 'tr',
          },
          {
            children: [
              {
                children: [
                  {
                    text: expect.stringMatching(
                      /^Pokemon|Pikachu|Charizard|Bulbasaur|Squirtle|Jigglypuff|Mewtwo$/
                    ),
                  },
                ],
                id: '2ejdj3dj32d923dj',
                type: 'td',
              },
              {
                children: [
                  {
                    text: expect.stringMatching(
                      /^Pokemon|Pikachu|Charizard|Bulbasaur|Squirtle|Jigglypuff|Mewtwo$/
                    ),
                  },
                ],
                id: '2edjwo3tywkfbr0hfewg3ejjokpok',
                type: 'td',
              },
            ],
            id: '3edjed039ic9didicvkk',
            type: 'tr',
          },
        ],
        id: '2wr03rifdsk30rfsd',
        type: 'table',
      },
      {
        children: [
          {
            text: '🎯 What about marketing?',
          },
        ],
        id: 'xHCDeKqDxpFqJxDAdXjDI',
        type: 'h2',
      },
      {
        children: [
          {
            text: 'What percentage of my net revenue ',
          },
          {
            italic: true,
            text: '(before expenses)',
          },
          {
            text: ' would I allocate to marketing initiatives? ',
          },
        ],
        id: 'n2uD1VwAOCMN1FQOMngPv',
        type: 'p',
      },
    ]);
  }, 240000);
});
