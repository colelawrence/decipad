import { DeciRuntime } from './';
import { createEditor } from 'slate';
import { timeout } from '@decipad/testutils';

const docId = 'docid';

describe('pad editor', () => {
  test('sends changes', async () => {
    const deci = new DeciRuntime({
      userId: 'TEST_USER_ID',
      actorId: 'TEST_ACTOR_ID',
    });
    const model = deci.startPadEditor(docId);
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
      path: [0, 0],
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
    const model = deci.startPadEditor(docId);

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
        type: 'p',
        children: [
          {
            text: 'A new string of text to be inserted.',
          },
        ],
      },
    ]);

    model.stop();
    deci.stop();
  });
});
