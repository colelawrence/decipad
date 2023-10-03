/* eslint-disable jest/no-standalone-expect */
import { testWithSandbox as test } from '../../../backend-test-sandbox/src';
import { notebookAssistant } from '../notebookAssistant/notebookAssistant';
import { setupTest } from './_setupTest';
import simplest from './__fixtures__/simplest.json';
import { Document } from '@decipad/editor-types';

test('notebook assistant: prose', async (ctx) => {
  let newNotebookId: string;
  setupTest(ctx, simplest as Document, ({ notebookId }) => {
    newNotebookId = notebookId;
  });

  it('can change the title of a notebook', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the title text to say "🕯Stopping a Candle Business"'
    );
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "text": "🕯Starting a Candle Business",
          },
          "path": [
            0,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "🕯Starting a Candle Business",
              },
            ],
            "id": "3JTr-B84cKMnNOYnvHiFi",
            "type": "h1",
          },
          "path": [
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "🕯Stopping a Candle Business",
              },
            ],
            "id": "3JTr-B84cKMnNOYnvHiFi",
            "type": "h1",
          },
          "path": [
            0,
          ],
          "type": "insert_node",
        },
      ]
    `);
  }, 240000);

  it('can remove a paragraph', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'remove the last paragraph'
    );
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "node": {
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
          "path": [
            2,
          ],
          "type": "remove_node",
        },
      ]
    `);
  }, 240000);

  it('can add a paragraph', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'add a paragraph asking people to follow me on Twitter'
    );
    expect(results).toMatchObject([
      {
        node: {
          children: [
            {
              text: expect.stringContaining('Twitter'),
            },
          ],
          id: expect.any(String),
          type: 'p',
        },
        path: [3],
        type: 'insert_node',
      },
    ]);
  }, 240000);

  it('can change a paragraph', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the second paragraph asking people to follow me on Twitter'
    );
    expect(results).toMatchObject([
      {
        node: {
          text: 'During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!',
        },
        path: [1, 0],
        type: 'remove_node',
      },
      {
        node: {
          children: [
            {
              text: 'During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!',
            },
          ],
          id: '18YPGVFcBkSie3WopWDlo',
          type: 'p',
        },
        path: [1],
        type: 'remove_node',
      },
      {
        node: {
          children: [
            {
              text: expect.stringContaining('Twitter'),
            },
          ],
          id: '18YPGVFcBkSie3WopWDlo',
          type: 'p',
        },
        path: [1],
        type: 'insert_node',
      },
    ]);
  }, 240000);

  it('can add a code line to a notebook without code lines', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'add a code line calculating 3 divided by 4'
    );
    expect(results).toMatchObject([
      {
        node: {
          children: [
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'structured_varname',
            },
            {
              children: [
                {
                  text: expect.stringMatching(/^3 ?\/ ?4$/),
                },
              ],
              type: 'code_line_v2_code',
            },
          ],
          id: expect.any(String),
          showResult: true,
          type: 'code_line_v2',
        },
        path: [3],
        type: 'insert_node',
      },
    ]);
  }, 240000);
});
