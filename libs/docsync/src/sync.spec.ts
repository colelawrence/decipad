import { nanoid } from 'nanoid';
import { Server as WebSocketServer, WebSocket } from 'mock-socket';
import waitForExpect from 'wait-for-expect';
import fetch from 'jest-fetch-mock';
import { Subscription } from 'rxjs';
import { Editor, createEditor, Operation, Node } from 'slate';
import { DocSync, SyncEditor } from './';
import randomChar from './utils/random-char';
import { toJS } from './utils/to-js';
import {
  syncApiServer,
  createWebsocketServer,
  timeout,
  TestStorage,
  tickUntil,
} from '@decipad/testutils';
import { SyncNode } from './types';

waitForExpect.defaults.interval = 500;

const fetchPrefix = 'http://localhost:3333';
const maxTinyTimeout = 50;
const maxSmallTimeout = 500;
const replicaCount = 3;
const randomChangeCountPerReplica = 100;

const FAKE_TIME_TICK_MS = 50;

describe('sync', () => {
  const replicas: DocSync[] = [];
  let websocketServer: WebSocketServer;
  const docId = nanoid();
  const docContents: SyncEditor[] = [];
  const docSubscriptions: Subscription[] = [];
  const docEditors: Editor[] = [];
  let deciWebsocketServer = null;

  beforeAll(() => {
    for (let i = 0; i < replicaCount; i++) {
      replicas.push(new DocSync({ userId: nanoid(), actorId: nanoid() }));
    }
  });

  beforeAll(() => {
    websocketServer = new WebSocketServer('ws://localhost:3333/ws');
    deciWebsocketServer = createWebsocketServer();
    websocketServer.on('connection', deciWebsocketServer.socketHandler);

    fetch.mockIf(
      () => true,
      syncApiServer(deciWebsocketServer, {
        fetchPrefix,
        maxTinyTimeout,
      })
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('can send and receive extraneous websocket messages', (done) => {
    const docsync = replicas[0];
    const WebsocketClass = docsync.websocketImpl();
    const websocket = new WebsocketClass('bogus url');
    let hadResponse = false;
    let completed = false;
    websocket.onopen = (event: Event) => {
      if (completed) {
        return;
      }
      expect(event).toBeDefined();
      expect(websocket.binaryType).toBe('blob');
      expect(websocket.extensions).toBe(undefined);
      expect(websocket.protocol).toBe('thisisagreattokenjustforyou');
      expect(websocket.url).toBe('ws://localhost:3333/ws');

      websocket.onclose = (event: Event) => {
        expect(event).toBeDefined();
        expect(hadResponse).toBe(true);
        expect(websocket.readyState).toBe(WebSocket.CLOSED);
        completed = true;
        done();
      };

      websocket.onmessage = (event: MessageEvent) => {
        const m = JSON.parse(event.data.toString());
        expect(m).toMatchObject({ type: 'pong' });
        hadResponse = true;
        websocket.close();
      };
    };

    websocket.send(JSON.stringify({ type: 'ping' }));

    expect(websocket.readyState).toBe(WebSocket.CONNECTING);
  });

  it('creates a pad on one of the replicas', async () => {
    const replica = replicas[0];
    const content = replica.edit(docId, {
      storage: new TestStorage(), // separate local storage for tests
    });
    docContents.push(content);

    const editor = createEditor();
    docEditors.push(editor);
    docSubscriptions.push(wireEditor(editor, content));
  });

  it('creates other replicas', async () => {
    for (let i = 1; i < replicaCount; i++) {
      const content = replicas[i].edit(docId, {
        storage: new TestStorage(), // separate local storage for tests
      });
      docContents.push(content);

      const editor = createEditor();
      docEditors.push(editor);
      docSubscriptions.push(wireEditor(editor, content));
    }
  });

  it('all pad contents match initially', async () => {
    const expectedValue = docContents[0].getValue();
    const expectedValues = docContents.map(() => toJS(expectedValue));
    const values = docContents.map((pc) => pc.getValue());
    expect(values).toMatchObject(expectedValues);
  });

  it('makes random changes to the editors', async () => {
    jest.useFakeTimers();
    await tickUntil(
      randomChangesToEditors(docEditors, randomChangeCountPerReplica),
      FAKE_TIME_TICK_MS
    );
  });

  it('pad contents converge', async () => {
    jest.useFakeTimers();
    await tickUntil(
      waitForExpect(() => {
        const expectedValue = docContents[0].getValue();
        const expectedValues = docContents.map(() => toJS(expectedValue));
        const values = docContents.map((pc) => pc.getValue());
        expect(values).toMatchObject(expectedValues);
      }),
      FAKE_TIME_TICK_MS
    );
  });

  it('pad contents match each editor content', () => {
    const expectedValues = docContents.map((pc) => pc.getValue());
    const values = docEditors.map((pe) => toJS(pe.children));
    expect(values).toMatchObject(expectedValues);
  });

  afterAll(() => {
    for (const sub of docSubscriptions) {
      sub.unsubscribe();
    }
  });

  afterAll(() => {
    for (const replica of replicas) {
      replica.stop();
    }
  });

  afterAll((done) => {
    websocketServer.stop(done);
  });
});

function wireEditor(editor: Editor, content: SyncEditor) {
  const sub = content.slateOps().subscribe((ops) => {
    Editor.withoutNormalizing(editor, () => {
      for (const op of ops) {
        editor.apply(op);
      }
    });
  });

  editor.children = content.getValue();
  editor.onChange = () => {
    const ops = editor.operations;
    if (ops && ops.length) {
      editor.operations = [];
      content.sendSlateOperations(ops);
    }
  };

  return sub;
}

async function randomChangesToEditors(editors: Editor[], changeCount: number) {
  await Promise.all(
    editors.map((editor) => randomChangesToEditor(editor, changeCount))
  );
}

async function randomChangesToEditor(editor: Editor, changeCount: number) {
  for (let i = 0; i < changeCount; i++) {
    await randomSmallTimeout();
    const ops = randomChangeToEditor(editor);
    Editor.withoutNormalizing(editor, () => {
      for (const op of ops) {
        editor.apply(op);
      }
    });
  }
}

function randomChangeToEditor(editor: Editor): Operation[] {
  const candidates = editor.children;
  const candidateIndex = pickRandomIndex(candidates);
  const candidate = candidates[candidateIndex] as { children: Node[] };
  const text = ((candidate.children as Node[])[0] as { text: string })
    .text as string;

  if (text.length < 6) {
    return randomInsert(candidateIndex, text);
  }

  // TODO: random merge
  const candidateOp = pickRandom([randomInsert, randomRemove, randomSplit]);

  return candidateOp(candidateIndex, text, candidate);
}

function randomInsert(index: number, text: string): Operation[] {
  const ops: Operation[] = [];
  const pos = pickRandomIndex(text);
  ops.push({
    type: 'insert_text',
    path: [index, 0],
    offset: pos,
    text: randomChar(),
  });

  return ops;
}

function randomRemove(index: number, text: string): Operation[] {
  const ops: Operation[] = [];
  const pos = pickRandomIndex(text);
  ops.push({
    type: 'remove_text',
    path: [index, 0],
    offset: pos,
    text: text[pos],
  });

  return ops;
}

function randomSplit(index: number, text: string, node: Element): Operation[] {
  const ops: Operation[] = [];
  const pos = pickRandomIndex(text);
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
    } as Partial<SyncNode>,
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
