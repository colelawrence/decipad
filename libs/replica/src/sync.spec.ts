import { nanoid } from 'nanoid';
import { Server as WebSocketServer, WebSocket } from 'mock-socket';
import waitForExpect from 'wait-for-expect';
import fetch from 'jest-fetch-mock';
import Automerge, { Text, List } from 'automerge';
import assert from 'assert';
import { createReplica, Replica } from './replica';
import { Sync } from './sync';
import { timeout } from './utils/timeout';
import randomChar from './utils/random-char';
import { toJS } from './utils/to-js';

type Model = List<Text>;

interface DeciWebsocketServer {
  socketHandler(socket: WebSocket): void;
  notify(topic: string, message: string): void;
}

waitForExpect.defaults.interval = 500;

const replicaCount = 5;
const randomChangeCountPerReplica = 100;
const maxSmallTimeout = 500;
const maxTinyTimeout = 50;
const fetchPrefix = 'http://localhost:3333/api';
const maxRetryIntervalMs = 3000;
const sendChangesDebounceMs = 1;

const syncOptions = {
  start: true,
  fetchPrefix: 'http://localhost:3333',
  maxReconnectMs: 3000,
};

describe('sync', () => {
  const globalSyncs: Sync<Model>[] = [];
  const replicas: Replica<Model>[] = [];
  let websocketServer: WebSocketServer;
  let deciWebsocketServer = null;

  beforeAll(() => {
    for (let i = 0; i < replicaCount; i++) {
      const sync = new Sync<Model>(syncOptions);
      globalSyncs.push(sync);
      replicas.push(
        createReplica<Model>({
          name: 'shared1',
          userId: nanoid(),
          actorId: nanoid(),
          sync,
          fetchPrefix,
          maxRetryIntervalMs,
          sendChangesDebounceMs,
          createIfAbsent: true,
          initialValue: [],
          initialStaticValue:
            '["~#iL",[["~#iM",["ops",["^0",[["^1",["action","makeList","obj","d773c7d9-291d-4550-90a9-a6212a40ac64"]],["^1",["action","link","obj","00000000-0000-0000-0000-000000000000","key","value","value","d773c7d9-291d-4550-90a9-a6212a40ac64"]]]],"actor","e304e70a-81dc-4806-87ce-462f68f4771d","seq",1,"deps",["^1",[]],"message","Initialization","undoable",false]]]]',
        })
      );
    }
  });

  beforeAll(() => {
    websocketServer = new WebSocketServer('ws://localhost:3333/ws');
    deciWebsocketServer = createDeciWebsocketServer();
    websocketServer.on('connection', deciWebsocketServer.socketHandler);

    fetch.mockIf(() => true, apiServer(deciWebsocketServer));
  });

  afterAll(() => {
    for (const sync of globalSyncs) {
      sync.stop();
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

  it('can send and receive extraneous websocket messages', (done) => {
    const sync = globalSyncs[0];
    const WebsocketClass = sync.websocketImpl();
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

  it('gets the replica contents', async () => {
    let first;
    for (const rep of replicas) {
      const content = await toJS(rep.getValue());
      if (!first) {
        first = content;
      } else {
        expect(content).toMatchObject(first);
      }
    }
  }, 10000);

  it('makes random changes to the replicas', async () => {
    await randomChangesToReplicas(replicas, randomChangeCountPerReplica);
  }, 90000);

  // it('waits a bit', async () => await timeout(10000), 11000);

  it('all converges', async () => {
    await waitForExpect(
      () => {
        const r1Value = toJS(replicas[0].getValue());
        for (const replica2 of replicas.slice(1)) {
          const r2Value = toJS(replica2.getValue());
          // test if contents are in sync
          expect(r1Value).toMatchObject(r2Value);
        }
      },
      30000,
      1000
    );
  }, 130000);
});

function apiServer(deciWebsocketServer: DeciWebsocketServer) {
  const store = new Map<string, string>();
  return async (req: Request) => {
    assert(req.url.startsWith(fetchPrefix));
    await randomTinyTimeout();

    let resp;
    if (
      req.method === 'GET' &&
      req.url === fetchPrefix + '/auth/token?for=pubsub'
    ) {
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

    await randomTinyTimeout();

    return resp;
  };

  async function changes(req: Request) {
    try {
      const key = req.url.substring(
        fetchPrefix.length,
        req.url.length - '/changes'.length
      );
      if (store.has(key)) {
        const before = Automerge.load(store.get(key)!);
        const changes = await req.json();
        const after = Automerge.applyChanges(before, changes);
        await randomTinyTimeout();
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
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function put(req: Request) {
    try {
      const key = req.url.substring(fetchPrefix.length);
      const remoteText = await req.text();
      const before = Automerge.load(store.get(key) || remoteText);
      const remote = Automerge.load(remoteText);
      const after = Automerge.merge(before, remote);

      await randomTinyTimeout();
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
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function get(req: Request) {
    try {
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
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

function createDeciWebsocketServer(): DeciWebsocketServer {
  const subscriptions = new Map<string, WebSocket[]>();

  function socketHandler(socket: WebSocket) {
    socket.on('message', (message) => {
      let topicSubscriptions: WebSocket[] | undefined = [];
      const m = JSON.parse(message.toString());
      let op: string;
      let topic: string | undefined;
      if (Array.isArray(m)) {
        [op, topic] = m as [string, string];
        if (topic) {
          topicSubscriptions = subscriptions.get(topic) || [];
          if (!topicSubscriptions) {
            subscriptions.set(topic, topicSubscriptions);
          }
        }
      } else {
        op = m.type;
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

        case 'ping':
          socket.send(JSON.stringify({ type: 'pong' }));
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

async function randomChangesToReplicas(
  replicas: Replica<Model>[],
  changeCount: number
) {
  await Promise.all(
    replicas.map((replica) => randomChangesToReplica(replica, changeCount))
  );
}

async function randomChangesToReplica(
  replica: Replica<Model>,
  changeCount: number
) {
  for (let i = 0; i < changeCount; i++) {
    await randomSmallTimeout();
    randomChangeToReplica(replica);
  }
}

function randomChangeToReplica(replica: Replica<Model>) {
  const value = replica.getValue();
  const candidates = value!;
  const candidateIndex = pickRandomIndex(candidates);
  const candidate = candidates[candidateIndex];
  if (!candidate || candidate.length < 6) {
    return randomInsert(replica, candidateIndex);
  }

  const candidateOp = pickRandom([randomInsert, randomRemove, randomSplit]);

  candidateOp(replica, candidateIndex);
}

function randomInsert(replica: Replica<Model>, index: number) {
  replica.mutate((model) => {
    let text = model[index] as Text;
    if (text === undefined) {
      text = new Text();
      model[index] = text;
    }
    const pos = pickRandomIndex(text);
    text!.insertAt!(pos, randomChar());
  });
}

function randomRemove(replica: Replica<Model>, index: number) {
  replica.mutate((model) => {
    const text = model[index] as Text;
    const pos = pickRandomIndex(text);
    text!.deleteAt!(pos);
  });
}

function randomSplit(replica: Replica<Model>, index: number) {
  replica.mutate((model) => {
    const text = model[index] as Text;
    const pos = pickRandomIndex(text);
    const rest = new Text(text!.slice(pos).join(''));
    model[index] = new Text(text.slice(0, pos).join(''));
    model!.insertAt!(index + 1, rest);
  });
}

function randomSmallTimeout() {
  return timeout(Math.floor(Math.random() * maxSmallTimeout));
}

function randomTinyTimeout() {
  return timeout(Math.floor(Math.random() * maxTinyTimeout));
}

function pickRandom(arr: Array<any>): any {
  const index = pickRandomIndex(arr);
  return arr[index];
}

function pickRandomIndex(arr: any[] | string): number {
  return Math.floor(Math.random() * arr.length);
}
