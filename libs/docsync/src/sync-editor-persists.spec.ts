import { createEditor } from 'slate';
import waitForExpect from 'wait-for-expect';
import { getDefined } from '@decipad/utils';
import { withDocSync, DocSyncEditor } from '.';

describe('pad editor persistence', () => {
  let editor: DocSyncEditor | undefined;
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
    editor = withDocSync(createEditor(), 'docid', { ws: false });
    editor.onLoaded(onLoaded);
    editor.onSaved(onSaved);
  });

  afterEach(() => {
    onLoadedImpl = undefined;
    onSavedImpl = undefined;
  });

  test('loads', async () => {
    let loaded = false;
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
      node: { children: [{ text: '' }] },
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

    expect(e.children).toMatchInlineSnapshot(`
Array [
  Object {
    "children": Array [
      Object {
        "text": "A new string of text to be inserted.",
      },
    ],
  },
  Object {
    "children": Array [
      Object {
        "text": "",
      },
    ],
    "type": "h1",
  },
  Object {
    "children": Array [
      Object {
        "text": "",
      },
    ],
    "type": "p",
  },
]
`);

    e.destroy();
  });

  test('loads document as was saved', async () => {
    let loaded = false;
    const onLoaded2 = (source: string) => {
      expect(source).toBe('local');
      loaded = true;
    };
    const editor2 = withDocSync(createEditor(), 'docid', { ws: false });
    editor2.onLoaded(onLoaded2);

    await waitForExpect(() => {
      expect(loaded).toBe(true);
    });

    expect(editor2.children).toMatchInlineSnapshot(`
Array [
  Object {
    "children": Array [
      Object {
        "text": "A new string of text to be inserted.",
      },
    ],
  },
  Object {
    "children": Array [
      Object {
        "text": "",
      },
    ],
    "type": "h1",
  },
  Object {
    "children": Array [
      Object {
        "text": "",
      },
    ],
    "type": "p",
  },
]
`);
  });
});
