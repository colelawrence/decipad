import { createRuntime } from '.';
import { createEditor } from 'slate';
import { Type } from '../type';

const actorId = 'actor1';
const docId = 'docid';
const workerURL = 'dist/worker.js';

test('sends changes', async () => {
  const r = createRuntime(actorId);
  const context = r.contexts.create(docId, { workerURL });

  const editor = createEditor();

  editor.onChange = () => {
    const ops = editor.operations;
    if (ops && ops.length) {
      context.sendSlateOperations(ops);
    }
  };

  const cancel = context.subscribe({
    initialContext: (context) => {
      editor.children = context.children;
    },
    error: (err) => {
      throw Object.assign(new Error(), err);
    },
  });

  await context.start();

  // await timeout(2000)

  editor.apply({
    type: 'insert_text',
    path: [0, 0, 0],
    offset: 0,
    text: 'A new string of text to be inserted.',
  });

  await timeout(1000);

  cancel();
  context.stop();
});

test('loads document as was saved', async () => {
  const r = createRuntime(actorId);
  const context = r.contexts.create(docId, { workerURL });

  const editor = createEditor();

  editor.onChange = () => {
    const ops = editor.operations;
    if (ops && ops.length) {
      context.sendSlateOperations(ops);
    }
  };

  const cancel = context.subscribe({
    initialContext: (context) => {
      editor.children = context.children;
    },
    error: (err) => {
      throw Object.assign(new Error(), err);
    },
  });

  await context.start();

  expect(editor.children).toStrictEqual([
    {
      children: [
        {
          children: [
            {
              type: 'paragraph',
              text: 'A new string of text to be inserted.',
            },
          ],
        },
      ],
    },
  ]);

  cancel();
  context.stop();
});

it('runs code', async () => {
  const r = createRuntime(actorId);
  const context = r.contexts.create(docId, { workerURL });

  const editor = createEditor();

  editor.onChange = () => {
    const ops = editor.operations;
    if (ops && ops.length) {
      context.sendSlateOperations(ops);
    }
  };

  const cancel = context.subscribe({
    initialContext: (context) => {
      editor.children = context.children;
    },
    error: (err) => {
      throw Object.assign(new Error(), err);
    },
  });

  await context.start();

  await timeout(1000);

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
    },
  });

  await timeout(1000);
  const computeResult = await context.compute();

  expect(computeResult.ok).toBe(true);
  expect(computeResult.parseErrors).toHaveLength(0);
  expect(computeResult.typeInferErrors).toHaveLength(0);

  const result = await context.resultAt('code block 1', 3);
  expect(result.type.possibleTypes).toEqual(['number']);
  expect(result.type.unit).toMatchObject([
    {
      exp: 1,
      multiplier: 1,
      known: false,
      unit: 'apples',
    },
  ]);
  expect(result.value).toEqual([30]);

  const result2 = await context.resultAt('code block 1', 2);
  expect(result2.type.possibleTypes).toEqual(['number']);
  expect(result2.type.unit).toMatchObject([
    {
      exp: 1,
      multiplier: 1,
      known: false,
      unit: 'apples',
    },
  ]);
  expect(result2.value).toEqual([20]);

  cancel();
  context.stop();
});

function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}
