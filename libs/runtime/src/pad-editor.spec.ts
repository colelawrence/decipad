import { DeciRuntime } from './';
import { createEditor, Node } from 'slate';
import { timeout } from './utils/timeout';

const docId = 'docid';

describe('pad editor', () => {
  test('sends changes', async () => {
    const deci = new DeciRuntime({
      userId: 'TEST_USER_ID',
      actorId: 'TEST_ACTOR_ID',
    });
    const model = deci.startPadEditor(docId, true);
    const editor = createEditor();

    editor.onChange = () => {
      const ops = editor.operations;
      if (ops && ops.length) {
        model.sendSlateOperations(ops);
      }
    };

    editor.children = model.getValue() as Sync.Node[];

    editor.apply({
      type: 'insert_text',
      path: [0, 0, 0],
      offset: 0,
      text: 'A new string of text to be inserted.',
    });

    await timeout(1000);

    model.stop();

    deci.stop();
  });

  test('loads document as was saved', async () => {
    const deci = new DeciRuntime({
      userId: 'TEST_USER_ID',
      actorId: 'TEST_ACTOR_ID',
    });
    const model = deci.startPadEditor(docId, true);

    const editor = createEditor();

    editor.onChange = () => {
      const ops = editor.operations;
      if (ops && ops.length) {
        model.sendSlateOperations(ops);
      }
    };

    editor.children = model.getValue() as Sync.Node[];

    expect(editor.children).toMatchObject([
      {
        children: [
          {
            type: 'p',
            children: [
              {
                text: 'A new string of text to be inserted.',
              },
            ],
          },
        ],
      },
    ]);

    model.stop();
    deci.stop();
  });

  it('runs code', async () => {
    const deci = new DeciRuntime({
      userId: 'TEST_USER_ID',
      actorId: 'TEST_ACTOR_ID',
    });
    const model = deci.startPadEditor(docId, true);

    const editor = createEditor();

    editor.onChange = () => {
      const ops = editor.operations;
      if (ops && ops.length) {
        model.sendSlateOperations(ops);
      }
    };

    editor.children = model.getValue() as Sync.Node[];

    editor.apply({
      type: 'insert_node',
      path: [0, 0],
      node: {
        type: 'code_block',
        id: 'code block 1',
        children: [
          {
            text: 'a = 10 apples\nb = 20 apples\na + b',
          },
        ],
      } as Node,
    });

    await timeout(100);

    const result = await model.resultAt('code block 1', 3);
    expect(result.errors).toHaveLength(0);
    expect(result.type?.type).toEqual('number');
    expect(result.type?.unit).toMatchObject([
      {
        exp: 1,
        multiplier: 1,
        known: false,
        unit: 'apples',
      },
    ]);
    expect(result.value).toEqual([30]);

    const result2 = await model.resultAt('code block 1', 2);
    expect(result.errors).toHaveLength(0);
    expect(result2.type?.type).toEqual('number');
    expect(result2.type?.unit).toMatchObject([
      {
        exp: 1,
        multiplier: 1,
        known: false,
        unit: 'apples',
      },
    ]);
    expect(result2.value).toEqual([20]);

    model.stop();
    deci.stop();
  });

  it('handles syntax errors appropriately', async () => {
    const deci = new DeciRuntime({
      userId: 'TEST_USER_ID',
      actorId: 'TEST_ACTOR_ID',
    });
    const model = deci.startPadEditor('some other doc id', true);

    const editor = createEditor();

    editor.onChange = () => {
      const ops = editor.operations;
      if (ops && ops.length) {
        model.sendSlateOperations(ops);
      }
    };

    editor.children = model.getValue() as Sync.Node[];

    editor.apply({
      type: 'insert_node',
      path: [0, 0],
      node: {
        type: 'code_block',
        id: 'code block 1',
        children: [
          {
            text: 'a = 10 apples\n b = b[)21$q',
          },
        ],
      } as Node,
    });

    await timeout(100);

    const result = await model.resultAt('code block 1', 3);
    expect(result.type).toBeNull();
    expect(result.value).toBeNull();
    expect(result.errors).toHaveLength(1);

    const error = result.errors[0];
    expect(error).toMatchObject({
      lineNumber: 2,
      columnNumber: 7,
      message: 'Error',
    });

    model.stop();
    deci.stop();
  });
});
