import { disable } from '@decipad/feature-flags';
import { getDefined } from '@decipad/utils';
import waitForExpect from 'wait-for-expect';
import { createDocSyncEditor, DocSyncEditor } from '.';
import { EditorController } from '@decipad/notebook-tabs';

describe('pad editor persistence', () => {
  let editor: DocSyncEditor;
  const title = 'My Title';
  let onLoadedImpl: ((source: string) => void) | undefined;
  const onLoaded = (source: string) => {
    if (onLoadedImpl) {
      onLoadedImpl(source);
    }
  };
  let onSavedImpl: ((source: string) => void) | undefined;
  const onSaved = (source: string) => {
    if (onSavedImpl) {
      onSavedImpl(source);
    }
  };

  beforeAll(() => {
    editor = createDocSyncEditor('docid', {
      protocolVersion: 2,
      ws: false,
      controller: new EditorController('docid', []),
    });
    editor.onLoaded(onLoaded);
    editor.onSaved(onSaved);
  });

  beforeEach(() => {
    disable('POPULATED_NEW_NOTEBOOK');
  });

  afterEach(() => {
    onLoadedImpl = undefined;
    onSavedImpl = undefined;
  });

  test('loads', async () => {
    let loaded = editor.isLoadedLocally;
    onLoadedImpl = (source: string) => {
      expect(source).toBe('local');
      loaded = true;
    };

    await waitForExpect(() => {
      expect(loaded).toBe(true);
    });
  });

  test('Saves some small changes', async () => {
    let saved = false;
    onSavedImpl = (source: string) => {
      expect(source).toBe('local');
      saved = true;
    };
    const e = getDefined(editor);

    e.editorController.Loaded('none');

    e.editorController.apply({
      type: 'insert_node',
      path: [0],
      node: {
        type: 'title',
        id: 'titleID',
        children: [{ text: title }],
      },
    });

    await waitForExpect(() => {
      expect(saved).toBe(true);
    });

    expect(e.editorController.children).toMatchObject([
      {
        children: [
          {
            text: title,
          },
        ],
        type: 'title',
      },
    ]);

    e.destroy();
  });

  test('loads document as was saved', async () => {
    let loaded = false;
    const onLoaded2 = (source: string) => {
      expect(source).toBe('local');
      loaded = true;
    };
    const editor2 = createDocSyncEditor('docid', {
      ws: false,
      controller: new EditorController('docid', []),
      protocolVersion: 2,
    });
    editor2.onLoaded(onLoaded2);

    await waitForExpect(() => {
      expect(loaded).toBe(true);
    });

    expect(editor2.editorController.children).toMatchObject([
      {
        children: [
          {
            text: title,
          },
        ],
        type: 'title',
      },
    ]);
  });
});
