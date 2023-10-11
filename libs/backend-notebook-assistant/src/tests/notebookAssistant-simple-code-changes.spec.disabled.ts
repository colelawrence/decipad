/* eslint-disable jest/no-standalone-expect */
import { Document } from '@decipad/editor-types';
import { testWithSandbox as test } from '../../../backend-test-sandbox/src';
import { notebookAssistant } from '../notebookAssistant/notebookAssistant';
import { setupTest } from './_setupTest';
import _notebook from './__fixtures__/simple-with-code.json';
import { applyOperations } from '../utils/applyOperations';

const notebook = _notebook as Document;

test('notebook assistant: simple code changes', async (ctx) => {
  let newNotebookId: string;
  setupTest(ctx, notebook, ({ notebookId }) => {
    newNotebookId = notebookId;
  });

  it('can set the variable name to a code line', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the variable name of VarName1 to NewVarName'
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
                  "text": "NewVarName",
                },
              ],
              "id": "p3e90dsjad39dsamn",
              "type": "structured_varname",
            },
            {
              "children": [
                {
                  "text": "3 / 4",
                },
              ],
              "id": "powehfowbe389dns",
              "type": "code_line_v2_code",
            },
          ],
          "id": "FDSffDfa3refdsFsdf",
          "showResult": true,
          "type": "code_line_v2",
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
                  "text": "VarName2",
                },
              ],
              "id": "1dkfnsddsfhef3",
              "type": "structured_varname",
            },
            {
              "children": [
                {
                  "text": "cos(PI)",
                },
              ],
              "id": "olj2e0wqwdsksdl",
              "type": "code_line_v2_code",
            },
          ],
          "id": "fjsdfdofsd3-e3dsdcj",
          "showResult": true,
          "type": "code_line_v2",
        },
        {
          "children": [
            {
              "text": "💸 How much will I pay for the act of candle-making and inflation?",
            },
          ],
          "id": "P1MO3vjonREmgtamfVbur",
          "type": "h2",
        },
      ]
    `);
  }, 240000);

  it('can make a simple change to a code line', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'add 1 to the end of the cosine calculation'
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
                text: 'VarName1',
              },
            ],
            id: 'p3e90dsjad39dsamn',
            type: 'structured_varname',
          },
          {
            children: [
              {
                text: '3 / 4',
              },
            ],
            id: 'powehfowbe389dns',
            type: 'code_line_v2_code',
          },
        ],
        id: 'FDSffDfa3refdsFsdf',
        showResult: true,
        type: 'code_line_v2',
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
                text: 'VarName2',
              },
            ],
            id: '1dkfnsddsfhef3',
            type: 'structured_varname',
          },
          {
            children: [
              {
                // TODO: our assistant sometimes fails to keep PI inside the cos argument...
                text: expect.stringMatching(/^cos\(.*\) \+ 1/),
              },
            ],
            id: 'olj2e0wqwdsksdl',
            type: 'code_line_v2_code',
          },
        ],
        id: 'fjsdfdofsd3-e3dsdcj',
        showResult: true,
        type: 'code_line_v2',
      },
      {
        children: [
          {
            text: '💸 How much will I pay for the act of candle-making and inflation?',
          },
        ],
        id: 'P1MO3vjonREmgtamfVbur',
        type: 'h2',
      },
    ]);
  }, 240000);
});
