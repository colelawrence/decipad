import { DocSync } from './';
import {
  Editor,
  createEditor,
  Operation as SlateOperation,
  Element,
} from 'slate';
import { LoremIpsum } from 'lorem-ipsum';
import { nanoid } from 'nanoid';
import waitForExpect from 'wait-for-expect';
import { SyncEditor } from './sync-editor';

waitForExpect.defaults.interval = 100;

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

const docId = 'docid';

describe('slate to replica sync', () => {
  let sync1: DocSync, editor1: Editor, model1: SyncEditor;
  let sync2: DocSync, editor2: Editor, model2: SyncEditor;
  let firstText: string;
  let secondText: string;

  beforeAll(async () => {
    sync1 = new DocSync({
      userId: 'TEST_USER_ID',
      actorId: 'TEST_ACTOR_ID_1',
    });
    model1 = sync1.edit(docId);

    editor1 = createEditor();

    editor1.onChange = () => {
      const ops = editor1.operations;
      if (ops && ops.length) {
        model1.sendSlateOperations(ops);
      }
    };

    editor1.children = model1.getValue() as Sync.Node[];
  });

  beforeAll(async () => {
    sync2 = new DocSync({
      userId: 'TEST_USER_ID',
      actorId: 'TEST_ACTOR_ID_2',
    });
    model2 = sync2.edit(docId);

    editor2 = createEditor();

    editor2.onChange = () => {
      const ops = editor2.operations;
      if (ops && ops.length) {
        model2.sendSlateOperations(ops);
      }
    };

    model2.slateOps().subscribe((slateOps) => {
      Editor.withoutNormalizing(editor2, () => {
        for (const op of slateOps) {
          editor2.apply(op);
        }
      });
    });

    editor2.children = model2.getValue() as Sync.Node[];
  });

  test('text insertion works', async () => {
    const [ops, text] = createRandomInsertSlateOperations();
    firstText = text;
    Editor.withoutNormalizing(editor1, () => {
      for (const op of ops) {
        editor1.apply(op);
      }
    });

    // wait until slate sends ops to model and model processes them
    await Promise.resolve();
    model1.flush();

    expect(model1.getValue()).toMatchObject(editor1.children);

    expect(model1.getValue()).toMatchObject([
      {
        type: 'p',
        children: [
          {
            text: text,
          },
        ],
      },
      {
        type: 'p',
        children: [
          {
            text: '',
          },
        ],
      },
    ]);

    await waitForExpect(() => {
      expect(editor2.children).toMatchObject(editor1.children);
    });
  });

  test('carriage return at end of line works', async () => {
    Editor.withoutNormalizing(editor1, () => {
      editor1.apply({
        type: 'split_node',
        path: [0, 0],
        position: firstText.length,
        properties: {},
      });

      editor1.apply({
        type: 'split_node',
        path: [0],
        position: 1,
        properties: {
          type: 'p',
          id: nanoid(),
        } as Partial<Node>,
      } as SlateOperation);
    });

    // wait until slate sends ops to model and model processes them
    await Promise.resolve();
    model1.flush();

    expect(model1.getValue()).toMatchObject(editor1.children);

    expect(model1.getValue()).toMatchObject([
      {
        type: 'p',
        children: [
          {
            text: firstText,
          },
        ],
      },
      {
        type: 'p',
        children: [
          {
            text: '',
          },
        ],
      },
      {
        type: 'p',
        children: [
          {
            text: '',
          },
        ],
      },
    ]);

    await waitForExpect(() => {
      expect(editor2.children).toMatchObject(editor1.children);
    });
  });

  test('more text after works', async () => {
    const [ops, text] = createRandomInsertSlateOperations(1);
    secondText = text;

    Editor.withoutNormalizing(editor1, () => {
      for (const op of ops) {
        editor1.apply(op);
      }
    });

    // wait until slate sends ops to model and model processes them
    await Promise.resolve();
    model1.flush();

    expect(model1.getValue()).toMatchObject(editor1.children);

    expect(model1.getValue()).toMatchObject([
      {
        type: 'p',
        children: [
          {
            text: firstText,
          },
        ],
      },
      {
        type: 'p',
        children: [
          {
            text: secondText,
          },
        ],
      },
      {
        type: 'p',
        children: [
          {
            text: '',
          },
        ],
      },
      {
        type: 'p',
        children: [
          {
            text: '',
          },
        ],
      },
    ]);

    await waitForExpect(() => {
      expect(editor2.children).toMatchObject(editor1.children);
    });
  });

  test('random edits work', async () => {
    Editor.withoutNormalizing(editor1, () => {
      for (let i = 0; i < 100; i++) {
        const op = randomEdit(editor1);
        editor1.apply(op);
      }
    });

    // wait until slate sends ops to model and model processes them
    await Promise.resolve();
    model1.flush();

    expect(model1.getValue()).toMatchObject(editor1.children);

    await waitForExpect(() => {
      expect(editor2.children).toMatchObject(editor1.children);
    });
  });

  test('merges two lines', async () => {
    const ops = mergeTwoFirstLines(editor1);
    Editor.withoutNormalizing(editor1, () => {
      for (const op of ops) {
        editor1.apply(op);
      }
    });

    // wait until slate sends ops to model and model processes them
    await Promise.resolve();
    model1.flush();

    expect(model1.getValue()).toMatchObject(editor1.children);
    // console.log(JSON.stringify(editor.children, null, '\t'));

    await waitForExpect(() => {
      expect(editor2.children).toMatchObject(editor1.children);
    });
  });

  test('removes node', async () => {
    const ops = removeRandomNode(editor1);

    Editor.withoutNormalizing(editor1, () => {
      for (const op of ops) {
        editor1.apply(op);
      }
    });

    // wait until slate sends ops to model and model processes them
    await Promise.resolve();
    model1.flush();

    expect(model1.getValue()).toMatchObject(editor1.children);

    await waitForExpect(() => {
      expect(editor2.children).toMatchObject(editor1.children);
    });
  });

  test('moves node', async () => {
    const ops = moveRandomNode(editor1);

    Editor.withoutNormalizing(editor1, () => {
      for (const op of ops) {
        editor1.apply(op);
      }
    });

    // wait until slate sends ops to model and model processes them
    await Promise.resolve();
    model1.flush();

    expect(model1.getValue()).toMatchObject(editor1.children);

    await waitForExpect(() => {
      expect(editor2.children).toMatchObject(editor1.children);
    });
  });

  test('sets node', async () => {
    editor1.apply({
      type: 'set_node',
      path: [0, 0],
      properties: { bold: undefined } as Partial<Node>,
      newProperties: { bold: true } as Partial<Node>,
    } as SlateOperation);

    // wait until slate sends ops to model and model processes them
    await Promise.resolve();
    model1.flush();

    expect(model1.getValue()).toMatchObject(editor1.children);

    await waitForExpect(() => {
      expect(editor2.children).toMatchObject(editor1.children);
    });
  });

  test('unsets node', async () => {
    Editor.withoutNormalizing(editor1, () => {
      editor1.apply({
        type: 'set_node',
        path: [0, 0],
        properties: { bold: true } as Partial<Node>,
        newProperties: { bold: undefined } as Partial<Node>,
      } as SlateOperation);
    });

    // wait until slate sends ops to model and model processes them
    await Promise.resolve();
    model1.flush();

    expect(model1.getValue()).toMatchObject(editor1.children);

    await waitForExpect(() => {
      expect(editor2.children).toMatchObject(editor1.children);
    });
  });

  test('split text works', async () => {
    const ops = splitRandomText(editor1);

    Editor.withoutNormalizing(editor1, () => {
      for (const op of ops) {
        editor1.apply(op);
      }
    });

    // wait until slate sends ops to model and model processes them
    await Promise.resolve();
    model1.flush();

    expect(model1.getValue()).toMatchObject(editor1.children);

    await waitForExpect(() => {
      expect(editor2.children).toMatchObject(editor1.children);
    });
  });

  afterAll(() => {
    model1.stop();
    sync1.stop();
  });

  afterAll(() => {
    model2.stop();
    sync2.stop();
  });
});

function createRandomInsertSlateOperations(
  line = 0
): [SlateOperation[], string] {
  const ops: SlateOperation[] = [];

  const text = randomText();
  let i = 0;

  for (const c of text) {
    ops.push({
      type: 'insert_text',
      path: [line, 0],
      offset: i,
      text: c,
    });

    if (i === 0) {
      ops.push({
        type: 'insert_node',
        path: [line + 1],
        node: {
          type: 'p',
          children: [{ text: '' }],
          id: nanoid(),
        } as Partial<Node>,
      } as SlateOperation);
    }

    i++;
  }

  return [ops, text];
}

function randomText() {
  return lorem.generateWords(4);
}

function randomEdit(editor: Editor): SlateOperation {
  const candidates = editor.children;
  if (candidates.length === 0) {
    throw new Error('no candidates');
  }
  const pickedIndex = Math.floor(Math.random() * candidates.length);
  const candidate = candidates[pickedIndex] as Element;
  const text = (candidate.children[0] as { text: string }).text as string;
  const willRemove = !!text && Math.random() > 0.7;
  const pickedCharIndex = Math.floor(Math.random() * text.length);

  if (willRemove) {
    return {
      path: [pickedIndex, 0],
      text: text[pickedCharIndex],
      type: 'remove_text',
      offset: pickedCharIndex,
    };
  } else {
    return {
      type: 'insert_text',
      path: [pickedIndex, 0],
      text: randomChar(),
      offset: pickedCharIndex,
    };
  }
}

function randomChar(): string {
  const word = lorem.generateWords(1);
  const charIndex = Math.floor(Math.random() * word.length);
  return word[charIndex];
}

function mergeTwoFirstLines(editor: Editor): SlateOperation[] {
  const candidates = editor.children;
  if (candidates.length === 0) {
    throw new Error('no candidates');
  }

  const ops: SlateOperation[] = [];

  ops.push({
    type: 'remove_text',
    text: '',
    offset: (
      ((candidates[0] as Element).children[0] as { text: string })
        .text as string
    ).length,
    path: [0, 0],
  } as SlateOperation);

  ops.push({
    type: 'remove_text',
    text: '',
    path: [1, 0],
    offset: 0,
  });

  const secondLine = candidates[1] as Sync.Node;

  ops.push({
    type: 'merge_node',
    path: [1],
    position: 1,
    properties: {
      type: secondLine.type,
      id: secondLine.id,
    } as Partial<ExtendedSlate.ExtendedSlateOperation>,
  } as SlateOperation);

  return ops;
}

function removeRandomNode(editor: Editor): SlateOperation[] {
  const ops: SlateOperation[] = [];

  const candidates = editor.children;
  if (candidates.length === 0) {
    throw new Error('no candidates');
  }

  const selectedIndex = Math.floor(Math.random() * candidates.length);
  ops.push({
    type: 'remove_node',
    path: [selectedIndex],
    node: candidates[selectedIndex],
  });

  return ops;
}

function moveRandomNode(editor: Editor): SlateOperation[] {
  const ops: SlateOperation[] = [];

  const candidates = editor.children;
  if (candidates.length < 2) {
    throw new Error('less than 2 candidates');
  }

  const selectedIndex = Math.floor(Math.random() * candidates.length);

  let targetIndex;
  do {
    targetIndex = Math.floor(Math.random() * candidates.length);
  } while (targetIndex !== selectedIndex);

  ops.push({
    type: 'move_node',
    path: [selectedIndex],
    newPath: [targetIndex],
  });

  return ops;
}

function splitRandomText(editor: Editor): SlateOperation[] {
  const ops: SlateOperation[] = [];

  const candidates = editor.children;
  let targetIndex;

  do {
    targetIndex = Math.floor(Math.random() * candidates.length);
  } while (
    (
      ((candidates[targetIndex] as Element).children[0] as { text: string })
        .text as string
    ).length < 2
  );

  const candidate = candidates[targetIndex] as Element;

  const splitAt = Math.round(
    ((candidate.children[0] as { text: string }).text as string).length / 2
  );

  ops.push({
    type: 'split_node',
    path: [targetIndex, 0],
    position: splitAt,
    properties: {},
  });

  const { children: _, ...candidateExceptChildren } = candidate;

  ops.push({
    type: 'split_node',
    path: [targetIndex],
    position: 1,
    properties: candidateExceptChildren,
  });

  return ops;
}
