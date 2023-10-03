/* eslint-disable jest/no-standalone-expect */
import { Document } from '@decipad/editor-types';
import { testWithSandbox as test } from '../../../backend-test-sandbox/src';
import { notebookAssistant } from '../notebookAssistant/notebookAssistant';
import { setupTest } from './_setupTest';
import simpleWithCode from './__fixtures__/simple-with-code.json';

test('notebook assistant: simple code changes', async (ctx) => {
  let newNotebookId: string;
  setupTest(ctx, simpleWithCode as Document, ({ notebookId }) => {
    newNotebookId = notebookId;
  });

  it('can set the variable name to a code line', async () => {
    const results = await notebookAssistant(
      newNotebookId,
      'change the variable name of VarName1 to NewVarName'
    );
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "text": "VarName1",
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
                "text": "VarName1",
              },
            ],
            "id": "p3e90dsjad39dsamn",
            "type": "structured_varname",
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
                "text": "NewVarName",
              },
            ],
            "id": "p3e90dsjad39dsamn",
            "type": "structured_varname",
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

  it('can make a simple change to a code line', async () => {
    const results = await notebookAssistant(newNotebookId, 'add 1 to cosine');
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "node": {
            "text": "cos(PI)",
          },
          "path": [
            5,
            1,
            0,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "cos(PI)",
              },
            ],
            "id": "olj2e0wqwdsksdl",
            "type": "code_line_v2_code",
          },
          "path": [
            5,
            1,
          ],
          "type": "remove_node",
        },
        {
          "node": {
            "children": [
              {
                "text": "cos(PI) + 1",
              },
            ],
            "id": "olj2e0wqwdsksdl",
            "type": "code_line_v2_code",
          },
          "path": [
            5,
            1,
          ],
          "type": "insert_node",
        },
      ]
    `);
  }, 240000);
});
