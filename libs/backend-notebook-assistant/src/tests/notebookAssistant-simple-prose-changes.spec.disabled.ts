import { Document } from '@decipad/editor-types';
import { testWithSandbox as test } from '../../../backend-test-sandbox/src';
import { notebookAssistant } from '../notebookAssistant/notebookAssistant';
import { setupTest } from './_setupTest';
import _notebook from './__fixtures__/simplest.json';
import { applyOperations } from '../utils/applyOperations';

const notebook = _notebook as Document;

test('notebook assistant: prose', async (ctx) => {
  let newNotebookId: string;
  setupTest(ctx, notebook, ({ notebookId }) => {
    newNotebookId = notebookId;
  });

  it('can change the title of a notebook', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the title text to say "🕯Stopping a Candle Business"'
    );
    expect(applyOperations(notebook, results.operations))
      .toMatchInlineSnapshot(`
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
          ],
          "id": "vHiFdsiB84cKMOYn3JTr-",
          "name": "Main",
          "type": "tab",
        },
      ]
    `);
    expect(results.summary).toBe(
      'I have changed the title of your document from "🕯Starting a Candle Business" to "🕯Stopping a Candle Business".'
    );
  }, 240000);

  it('can remove a paragraph', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'remove the last paragraph'
    );
    expect(applyOperations(notebook, results.operations))
      .toMatchInlineSnapshot(`
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
              "children": [
                {
                  "text": "During the pandemic, many people thought of starting a side business, so I decided to see if my candle-making hobby could be profitable!",
                },
              ],
              "id": "18YPGVFcBkSie3WopWDlo",
              "type": "p",
            },
          ],
          "id": "vHiFdsiB84cKMOYn3JTr-",
          "name": "Main",
          "type": "tab",
        },
      ]
    `);
  }, 240000);

  it('can add a paragraph', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'add a paragraph asking people to follow me on Twitter'
    );
    expect(applyOperations(notebook, results.operations)).toMatchObject([
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
                text: 'Please follow me on Twitter!',
              },
            ],
            id: expect.any(String),
            type: 'p',
          },
        ],
        id: 'vHiFdsiB84cKMOYn3JTr-',
        name: 'Main',
        type: 'tab',
      },
    ]);
  }, 240000);

  it('can change a paragraph', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the second paragraph asking people to follow me on Twitter'
    );
    expect(applyOperations(notebook, results.operations)).toMatchObject([
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
        type: 'tab',
        id: 'vHiFdsiB84cKMOYn3JTr-',
        name: 'Main',
        children: [
          {
            children: [
              {
                text: expect.stringContaining('Twitter'),
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
        ],
      },
    ]);
  }, 240000);

  it('can add a code line to a notebook without code lines', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'add a code line calculating 3 divided by 4'
    );
    expect(applyOperations(notebook, results.operations)).toMatchObject([
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
        type: 'tab',
        id: 'vHiFdsiB84cKMOYn3JTr-',
        name: 'Main',
        children: [
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
                    text: '',
                  },
                ],
                id: expect.any(String),
                type: 'structured_varname',
              },
              {
                children: [
                  {
                    text: '3 / 4',
                  },
                ],
                id: expect.any(String),
                type: 'code_line_v2_code',
              },
            ],
            id: expect.any(String),
            showResult: true,
            type: 'code_line_v2',
          },
        ],
      },
    ]);
  }, 240000);
});
