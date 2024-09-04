import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import { disable } from '@decipad/feature-flags';
import { getDefined } from '@decipad/utils';
import type { DocSyncEditor } from '.';
import { createDocSyncEditor } from '.';
import { createTestEditorController } from './testEditorController';

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
      editor: createTestEditorController('docid', []),
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

  it('loads', async () => {
    let loaded = editor.isLoadedLocally;

    onLoadedImpl = (source: string) => {
      expect(source).toBe('local');
      loaded = true;
    };

    await vi.waitUntil(() => loaded, { interval: 100 });
  });

  it('Saves some small changes', async () => {
    let saved = false;
    onSavedImpl = (source: string) => {
      expect(source).toBe('local');
      saved = true;
    };
    const e = getDefined(editor);

    e.apply({
      type: 'insert_node',
      path: [0],
      node: {
        id: 'titleId',
        type: 'title',
        children: [{ text: '' }],
      },
    });

    e.apply({
      type: 'insert_text',
      path: [0, 0],
      offset: 0,
      text: title,
    });

    e.apply({
      type: 'insert_node',
      path: [1],
      node: {
        id: 'tabId',
        type: 'tab',
        name: 'My Tab',
        children: [
          {
            id: 'pId',
            type: 'p',
            children: [{ text: '' }],
          },
        ],
      },
    });

    await vi.waitUntil(() => saved, { interval: 100 });

    expect(e.children).toMatchObject([
      {
        children: [
          {
            text: title,
          },
        ],
        type: 'title',
        id: expect.any(String),
      },
      {
        children: expect.any(Array),
        type: 'tab',
        id: expect.any(String),
        name: expect.any(String),
      },
    ]);

    e.destroy();
  });

  it('loads document as was saved', async () => {
    let loaded = false;
    const onLoaded2 = (source: string) => {
      expect(source).toBe('local');
      loaded = true;
    };
    const editor2 = createDocSyncEditor('docid', {
      ws: false,
      editor: createTestEditorController('docid', []),
      protocolVersion: 2,
    });
    editor2.onLoaded(onLoaded2);

    await vi.waitUntil(() => loaded, { interval: 100 });

    expect(editor2.children).toMatchObject([
      {
        children: [
          {
            text: title,
          },
        ],
        type: 'title',
        id: expect.any(String),
      },
      {
        children: expect.any(Array),
        type: 'tab',
        id: expect.any(String),
        name: expect.any(String),
      },
    ]);
  });
});
