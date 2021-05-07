import { DeciRuntime } from './';
import { nanoid } from 'nanoid';
import { Server as WebSocketServer, WebSocket } from 'mock-socket';
import { timeout } from './utils/timeout';
import fetch from 'jest-fetch-mock';
import Automerge from 'automerge';
import { Subscription } from 'rxjs';
import assert from 'assert';
import { Editor, createEditor, Operation, Node } from 'slate';
import { PadEditor } from './pad-editor';

let CHARS = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'x',
  'y',
  'z',
  ' ',
];
CHARS = CHARS.concat(CHARS.map((c) => c.toUpperCase()));

const REPLICA_COUNT = 3;
const MAX_SMALL_TIMEOUT = 250;
const MAX_TINY_TIMEOUT = 50;
const fetchPrefix = process.env.DECI_API_URL + '/api';

describe('sync', () => {
  const replicas: DeciRuntime[] = [];
  let websocketServer: WebSocketServer;
  const workspaceId = nanoid();
  const padId = nanoid();
  const padContents: PadEditor[] = [];
  const padSubscriptions: Subscription[] = [];
  const padEditors: Editor[] = [];
  let deciWebsocketServer = null;

  beforeAll(() => {
    for (let i = 0; i < REPLICA_COUNT; i++) {
      const userId = nanoid();
      const actorId = nanoid();
      replicas.push(new DeciRuntime(userId, actorId));
    }
  });

  it('creates a pad on one of the replicas', async () => {
    const replica = replicas[0];
    const workspace = {
      id: workspaceId,
      name: 'Test workspace',
      permissions: [],
    };
    await replica.workspaces.create(workspace);

    const newPad = {
      id: padId,
      name: 'Test pad 1',
      workspaceId: workspaceId,
      lastUpdatedAt: new Date(),
      permissions: [],
      tags: ['tag 1', 'tag 2'],
    };
    await replica.workspace(workspaceId).pads.create(newPad);

    const content = replica.workspace(workspaceId).pads.edit(padId);
    padContents.push(content);

    const editor = createEditor();
    padEditors.push(editor);
    padSubscriptions.push(wireEditor(editor, content));
  });

  it('tries to load pad on other replicas to no avail', async () => {
    for (let i = 1; i < REPLICA_COUNT; i++) {
      const content = replicas[i].workspace(workspaceId).pads.edit(padId);
      padContents.push(content);

      expect(content.isOnlyRemote()).toBe(true);

      const editor = createEditor();
      padEditors.push(editor);
      padSubscriptions.push(wireEditor(editor, content));
    }

    const [, ...reps] = padContents;
    let hasResponses = false;
    for (const rep of reps) {
      rep.getValueEventually().then(() => {
        hasResponses = true;
      });
    }

    await timeout(3000);
    expect(hasResponses).toBe(false);
  });

  it('waits a bit', async () => {
    await timeout(3000);
  });

  it('starts api and websocket server', () => {
    websocketServer = new WebSocketServer('ws://localhost:3333/ws');
    deciWebsocketServer = createDeciWebsocketServer();
    websocketServer.on('connection', deciWebsocketServer.socketHandler);

    fetch.mockIf(() => true, apiServer(deciWebsocketServer));
  });

  it('gets the pad contents', async () => {
    let first;
    for (const rep of padContents) {
      const content = await rep.getValueEventually();
      if (!first) {
        first = content;
      } else {
        expect(content).toMatchObject(first);
      }
    }
  }, 10000);

  it('makes random changes to the editors', async () => {
    await randomChangesToEditors(padEditors, 100);
  }, 60000);

  it('waits a bit', async () => {
    await timeout(20000);
  }, 21000);

  it('all converged', () => {
    for (const editor1 of padEditors) {
      for (const editor2 of padEditors) {
        if (editor1 === editor2) {
          continue;
        }
        expect(editor1.children).toMatchObject(editor2.children);
      }

      for (const content of padContents) {
        expect(content.getValue()).toMatchObject(editor1.children);
      }
    }
  });

  afterAll(() => {
    for (const sub of padSubscriptions) {
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

function apiServer(deciWebsocketServer: DeciWebsocketServer) {
  const store = new Map<string, string>();
  return async (req: Request) => {
    assert(req.url.startsWith(fetchPrefix));
    await randomSmallTimeout();

    let resp;
    if (req.method === 'GET' && req.url === fetchPrefix + '/auth/token') {
      return {
        status: 200,
        body: 'thisisagreattokenjustforyou',
      };
    }
    if (req.method === 'PUT') {
      if (req.url.endsWith('/changes')) {
        resp = await changes(req);
      } else {
        resp = await put(req);
      }
    } else {
      resp = await get(req);
    }

    await randomSmallTimeout();

    return resp;
  };

  async function changes(req: Request) {
    const key = req.url.substring(
      fetchPrefix.length,
      req.url.length - '/changes'.length
    );
    if (store.has(key)) {
      const before = Automerge.load(store.get(key)!);
      const changes = await req.json();
      const after = Automerge.applyChanges(before, changes);
      await randomSmallTimeout();
      store.set(key, Automerge.save(after));

      // websocket notify subscribers
      if (changes.length > 0) {
        deciWebsocketServer.notify(
          key,
          JSON.stringify({ o: 'c', t: key, c: changes })
        );
      }

      return {
        status: 201,
      };
    }

    return {
      status: 404,
    };
  }

  async function put(req: Request) {
    const key = req.url.substring(fetchPrefix.length);
    const remoteText = await req.text();
    const before = Automerge.load(store.get(key) || remoteText);
    const remote = Automerge.load(remoteText);
    const after = Automerge.merge(before, remote);

    await randomSmallTimeout();
    store.set(key, Automerge.save(after));

    // websocket notify subscribers
    const changes = Automerge.getChanges(before, after);
    if (changes.length > 0) {
      deciWebsocketServer.notify(
        key,
        JSON.stringify({ o: 'c', t: key, c: changes })
      );
    }

    return {
      status: 201,
    };
  }

  async function get(req: Request) {
    const key = req.url.substring(fetchPrefix.length);
    if (store.has(key)) {
      return {
        status: 200,
        body: store.get(key),
      };
    }

    return {
      status: 404,
    };
  }
}

function createDeciWebsocketServer(): DeciWebsocketServer {
  const subscriptions = new Map<string, WebSocket[]>();

  function socketHandler(socket: WebSocket) {
    socket.on('message', (message) => {
      const [op, topic] = JSON.parse(message.toString()) as [string, string];
      let topicSubscriptions = subscriptions.get(topic);
      if (!topicSubscriptions) {
        topicSubscriptions = [];
        subscriptions.set(topic, topicSubscriptions);
      }

      switch (op) {
        case 'subscribe':
          topicSubscriptions.push(socket);
          socket.send(JSON.stringify({ o: 's', t: topic }));
          break;

        case 'unsubscribe':
          {
            const index = topicSubscriptions.indexOf(socket);
            if (index >= 0) {
              topicSubscriptions.splice(index, 1);
            }
            socket.send(JSON.stringify({ o: 'u', t: topic }));
          }

          break;

        default:
          throw new Error('unrecognized operation: ' + op);
      }
    });

    socket.on('close', () => {
      for (const sockets of subscriptions.values()) {
        const index = sockets.indexOf(socket);
        if (index >= 0) {
          sockets.splice(index, 1);
        }
      }
    });
  }

  function notify(topic: string, message: string) {
    const sockets = subscriptions.get(topic) || [];
    for (const socket of sockets) {
      try {
        socket.send(message);
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  }

  return {
    socketHandler,
    notify,
  };
}

function wireEditor(editor: Editor, content: PadEditor) {
  const sub = content.slateOps().subscribe((ops) => {
    Editor.withoutNormalizing(editor, () => {
      for (const op of ops) {
        editor.apply(op);
      }
    });
  });

  if (content.isOnlyRemote()) {
    content.getValueEventually().then((value) => {
      editor.children = value;
    });
  } else {
    editor.children = content.getValue();
  }

  editor.onChange = () => {
    const ops = editor.operations;
    if (ops && ops.length) {
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
    await randomTinyTimeout();
    const ops = randomChangeToEditor(editor);
    Editor.withoutNormalizing(editor, () => {
      for (const op of ops) {
        editor.apply(op);
      }
    });
  }
}

function randomChangeToEditor(editor: Editor): Operation[] {
  const candidates = editor.children[0].children as Node[];
  const candidateIndex = pickRandomIndex(candidates);
  const candidate = candidates[candidateIndex] as Node;
  const text = ((candidate.children as Node[])[0] as Node).text as string;

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
    path: [0, index, 0],
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
    path: [0, index, 0],
    offset: pos,
    text: text[pos],
  });

  return ops;
}

function randomSplit(index: number, text: string, node: Node): Operation[] {
  const ops: Operation[] = [];
  const pos = pickRandomIndex(text);
  const { children: _, ...props } = node;

  ops.push({
    type: 'split_node',
    path: [0, index, 0],
    position: pos,
    properties: {},
  });

  ops.push({
    type: 'split_node',
    path: [0, index],
    position: 1,
    properties: {
      ...props,
      id: nanoid(),
    },
  });

  return ops;
}

function randomSmallTimeout() {
  return timeout(Math.floor(Math.random() * MAX_SMALL_TIMEOUT));
}

function randomTinyTimeout() {
  return timeout(Math.floor(Math.random() * MAX_TINY_TIMEOUT));
}

function randomChar(): string {
  const charIndex = Math.floor(Math.random() * CHARS.length);
  return CHARS[charIndex];
}

function pickRandom(arr: Array<any>): any {
  const index = pickRandomIndex(arr);
  return arr[index];
}

function pickRandomIndex(arr: Array<any> | string): number {
  return Math.floor(Math.random() * arr.length);
}

interface DeciWebsocketServer {
  socketHandler(socket: WebSocket): void;
  notify(topic: string, message: string): void;
}
