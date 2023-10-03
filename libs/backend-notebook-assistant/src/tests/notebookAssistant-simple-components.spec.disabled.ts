/* eslint-disable jest/no-standalone-expect */
import { testWithSandbox as test } from '../../../backend-test-sandbox/src';
import { notebookAssistant } from '../notebookAssistant/notebookAssistant';
import { setupTest } from './_setupTest';
import document from './__fixtures__/simple-with-ui-components.json';
import { Document } from '@decipad/editor-types';
import { dequal } from '@decipad/utils';

test('notebook assistant: simple UI components', async (ctx) => {
  let newNotebookId: string;
  setupTest(ctx, document as Document, ({ notebookId }) => {
    newNotebookId = notebookId;
  });

  it('can add a slider', async () => {
    let results = await notebookAssistant(
      newNotebookId,
      'add another slider named MyNewSlider with default value of 10, min of 0 and max of 100'
    );
    if (
      dequal(results.slice(0, 2), [
        {
          node: {
            text: 'What percentage of my net revenue ',
          },
          path: [7, 0],
          type: 'remove_node',
        },
        {
          node: {
            italic: true,
            text: 'What percentage of my net revenue ',
          },
          path: [7, 0],
          type: 'insert_node',
        },
      ])
    ) {
      results = results.slice(2);
    }
    expect(results).toMatchObject([
      {
        node: {
          children: [
            {
              children: [
                {
                  text: 'MyNewSlider',
                },
              ],
              id: expect.any(String),
              type: 'caption',
            },
            {
              children: [
                {
                  text: '10',
                },
              ],
              id: expect.any(String),
              type: 'exp',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              id: expect.any(String),
              max: '100',
              min: '0',
              step: '1',
              type: 'slider',
              value: '10',
            },
          ],
          id: expect.any(String),
          type: 'def',
          variant: 'slider',
        },
        path: [8],
        type: 'insert_node',
      },
    ]);
  }, 240000);

  it('can change a slider caption', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the slider var name to be "MySlider1"'
    );
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "text": "nameoftheslider",
          },
          "path": [
            3,
            0,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "nameoftheslider",
              },
            ],
            "id": "-igGVqsXaHA80joO1eFUm",
            "type": "caption",
          },
          "path": [
            3,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "MySlider1",
              },
            ],
            "id": "-igGVqsXaHA80joO1eFUm",
            "type": "caption",
          },
          "path": [
            3,
            0,
          ],
          "type": "insert_node",
        },
      ]
    `);
  }, 240000);
});
