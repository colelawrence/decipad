import { timeout } from '@decipad/testutils';
import { ELEMENT_H1, ELEMENT_PARAGRAPH } from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { DocSync } from './';

const docId = 'docid';

describe('pad editor', () => {
  test('sends changes', async () => {
    const sync = new DocSync({
      userId: 'TEST_USER_ID',
      actorId: 'TEST_ACTOR_ID',
    });
    const model = sync.edit(docId);
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

    sync.stop();
  });

  test('loads document as was saved', async () => {
    const sync = new DocSync({
      userId: 'TEST_USER_ID',
      actorId: 'TEST_ACTOR_ID',
    });
    const model = sync.edit(docId);

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
        type: ELEMENT_H1,
        id: '6d1c2bbb-e354-4e73-83d4-77494a43327e',
        children: [{ text: 'A new string of text to be inserted.' }],
      },
      {
        type: ELEMENT_PARAGRAPH,
        id: '000000000000000000000',
        children: [
          {
            text: '',
          },
        ],
      },
    ]);

    model.stop();
    sync.stop();
  });
});
