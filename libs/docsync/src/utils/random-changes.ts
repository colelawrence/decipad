import { nanoid } from 'nanoid';
import { MyEditor, MyElement, MyNode, MyText } from '@decipad/editor-types';
import { TOperation, withoutNormalizing } from '@udecode/plate';
import { timeout } from '@decipad/utils';
import { randomChar } from './random-char';

const maxSmallTimeout = 50;

type DocSyncNode = MyNode & {
  id: string;
};

function initialInsert(): TOperation<MyElement>[] {
  return [
    {
      type: 'insert_node',
      path: [0],
      node: {
        children: [
          {
            text: '',
          },
        ],
      } as MyElement,
    },
  ];
}

export async function randomChangesToEditors(
  editors: MyEditor[],
  changeCount: number
) {
  await Promise.all(
    editors.map((editor) => randomChangesToEditor(editor, changeCount))
  );
}

async function randomChangesToEditor(editor: MyEditor, changeCount: number) {
  for (let i = 0; i < changeCount; i += 1) {
    // simulation
    // eslint-disable-next-line no-await-in-loop
    await randomSmallTimeout();
    const ops = randomChangeToEditor(editor);
    withoutNormalizing(editor, () => {
      for (const op of ops) {
        editor.apply(op);
      }
    });
  }
}

function randomChangeToEditor(editor: MyEditor): TOperation[] {
  const candidates = editor.children;
  if (candidates.length === 0) {
    return initialInsert();
  }
  const candidateIndex = pickRandomIndex(candidates);
  const candidate = candidates[candidateIndex];
  const { text } = candidate.children[0] as MyText;

  if (text.length < 6) {
    return randomInsert(candidateIndex, text);
  }

  // TODO: random merge
  const candidateOp = pickRandom([randomInsert, randomRemove, randomSplit]);

  return candidateOp(candidateIndex, text, candidate);
}

function randomInsert(index: number, text: string): TOperation[] {
  const ops: TOperation[] = [];
  const pos = pickRandomIndex(text);
  ops.push({
    type: 'insert_text',
    path: [index, 0],
    offset: pos,
    text: randomChar(),
  });

  return ops;
}

function randomRemove(index: number, text: string): TOperation[] {
  const ops: TOperation[] = [];
  const pos = pickRandomIndex(text);
  ops.push({
    type: 'remove_text',
    path: [index, 0],
    offset: pos,
    text: text[pos],
  });

  return ops;
}

function randomSplit(index: number, text: string, node: Element): TOperation[] {
  const ops: TOperation[] = [];
  const pos = pickRandomIndex(text);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children: _, ...props } = node;

  ops.push({
    type: 'split_node',
    path: [index, 0],
    position: pos,
    properties: {},
  });

  ops.push({
    type: 'split_node',
    path: [index],
    position: 1,
    properties: {
      ...props,
      id: nanoid(),
    } as Partial<DocSyncNode>,
  });

  return ops;
}

function randomSmallTimeout() {
  return timeout(Math.floor(Math.random() * maxSmallTimeout));
}

function pickRandom(arr: Array<any>): any {
  const index = pickRandomIndex(arr);
  return arr[index];
}

function pickRandomIndex(arr: Array<any> | string): number {
  return Math.floor(Math.random() * arr.length);
}
