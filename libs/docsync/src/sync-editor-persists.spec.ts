import { createTPlateEditor } from '@decipad/editor-types';
import { disable } from '@decipad/feature-flags';
import { getDefined } from '@decipad/utils';
import { TElement } from '@udecode/plate';
import waitForExpect from 'wait-for-expect';
import { createDocSyncEditor, DocSyncEditor } from '.';

describe('pad editor persistence', () => {
  let editor: DocSyncEditor;
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
      editor: createTPlateEditor(),
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

  test('allows some changes that get saved', async () => {
    let saved = false;
    onSavedImpl = (source: string) => {
      expect(source).toBe('local');
      saved = true;
    };
    const e = getDefined(editor);

    e.apply({
      type: 'insert_node',
      path: [0],
      node: { children: [{ text: '' }] } as TElement,
    });

    e.apply({
      type: 'insert_text',
      path: [0, 0],
      offset: 0,
      text: 'A new string of text to be inserted.',
    });

    await waitForExpect(() => {
      expect(saved).toBe(true);
    });

    expect(e.children).toMatchObject([
      {
        children: [
          {
            text: 'A new string of text to be inserted.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Welcome to Decipad!',
          },
        ],
        type: 'h1',
      },
      {
        children: [
          {
            text: '',
          },
        ],
        type: 'p',
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
      editor: createTPlateEditor(),
      protocolVersion: 2,
    });
    editor2.onLoaded(onLoaded2);

    await waitForExpect(() => {
      expect(loaded).toBe(true);
    });

    expect(editor2.children).toMatchObject([
      {
        children: [
          {
            text: 'A new string of text to be inserted.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Welcome to Decipad!',
          },
        ],
        type: 'h1',
      },
      {
        children: [
          {
            text: '',
          },
        ],
        type: 'p',
      },
    ]);
  });
});
