import { nanoid } from 'nanoid';
import { Subscription } from 'rxjs';
import { Server as WebSocketServer, WebSocket } from 'mock-socket';
import waitForExpect from 'wait-for-expect';
import fetch from 'jest-fetch-mock';
import { Text, List } from 'automerge';
import { createReplica, Replica, SyncStatus } from './';
import { Sync } from './sync';
import randomChar from './utils/random-char';
import { toJS } from './utils/to-js';
import { toSync } from './utils/to-sync';
import { cloneNode } from './utils/clone-node';
import { ReplicationStatus } from '@decipad/interfaces';
import {
  syncApiServer,
  createWebsocketServer,
  timeout,
  tickUntil,
  TestStorage,
} from '@decipad/testutils';

type BaseNode = { type: string; id: string; children: TextNode[] };
type TextNode = { text: Text };
type Model = List<BaseNode>;

waitForExpect.defaults.interval = 500;

const fetchPrefix = 'http://localhost:3333';

const replicaCount = 5;
const randomChangeCountPerReplica = 100;

// timers
const maxSmallTimeout = 500;
const maxTinyTimeout = 50;
const maxMicroTimeout = 10;
const maxRetryIntervalMs = 3000;
const sendChangesDebounceMs = 1;
const FAKE_TIME_TICK_MS = 50;

const syncOptions = {
  start: true,
  fetchPrefix: 'http://localhost:3333',
  maxReconnectMs: 3000,
};

const initialStaticValue =
  '["~#iL",[["~#iM",["ops",["^0",[["^1",["action","makeList","obj","982602ad-8ccc-406a-bd96-39df0b1a71c5"]],["^1",["action","ins","obj","982602ad-8ccc-406a-bd96-39df0b1a71c5","key","_head","elem",1]],["^1",["action","makeMap","obj","73fce065-0465-4547-8270-dcd75cb37bfb"]],["^1",["action","set","obj","73fce065-0465-4547-8270-dcd75cb37bfb","key","type","value","p"]],["^1",["action","makeList","obj","0055603a-6e3f-4e1d-87cb-9c9aec848906"]],["^1",["action","ins","obj","0055603a-6e3f-4e1d-87cb-9c9aec848906","key","_head","elem",1]],["^1",["action","makeMap","obj","1758ff95-f7ca-484c-a2fa-401397b65d8d"]],["^1",["action","makeText","obj","5778df97-5560-4410-a7c3-ba364d339ac9"]],["^1",["action","link","obj","1758ff95-f7ca-484c-a2fa-401397b65d8d","key","text","value","5778df97-5560-4410-a7c3-ba364d339ac9"]],["^1",["action","link","obj","0055603a-6e3f-4e1d-87cb-9c9aec848906","key","starter:1","value","1758ff95-f7ca-484c-a2fa-401397b65d8d"]],["^1",["action","link","obj","73fce065-0465-4547-8270-dcd75cb37bfb","key","children","value","0055603a-6e3f-4e1d-87cb-9c9aec848906"]],["^1",["action","set","obj","73fce065-0465-4547-8270-dcd75cb37bfb","key","id","value","000000000000000000000"]],["^1",["action","link","obj","982602ad-8ccc-406a-bd96-39df0b1a71c5","key","starter:1","value","73fce065-0465-4547-8270-dcd75cb37bfb"]],["^1",["action","link","obj","00000000-0000-0000-0000-000000000000","key","value","value","982602ad-8ccc-406a-bd96-39df0b1a71c5"]]]],"actor","starter","seq",1,"deps",["^1",[]],"message","Initialization","undoable",false]]]]';

const optionsToTest = [
  {
    useLocalStoreEvents: false,
    beforeRemoteChanges: () => randomMicroTimeout(),
  },
  {
    useLocalStoreEvents: false,
  },
  {
    useLocalStoreEvents: true,
  },
];

describe('sync', () => {
  describe.each(optionsToTest)('options = %j', (replicaOptions) => {
    const name = `/pads/${nanoid()}`;
    const globalSyncs: Sync<Model>[] = [];
    const replicas: Replica<Model>[] = [];
    const subscriptions: Subscription[] = [];
    const replicaObservedValues = new Array(replicaCount);
    let websocketServer: WebSocketServer;
    let deciWebsocketServer = null;

    afterEach(() => {
      // go back to real timers no matter the test result
      jest.useRealTimers();
    });

    beforeAll(() => {
      for (let i = 0; i < replicaCount; i++) {
        const sync = new Sync<Model>(syncOptions);
        globalSyncs.push(sync);

        const initialValue = toSync([
          {
            type: 'p',
            children: [
              {
                text: '',
              },
            ],
            id: '000000000000000000000',
          },
        ]) as Model;

        const replica = createReplica<Model>({
          name,
          userId: nanoid(),
          actorId: nanoid(),
          sync,
          fetchPrefix,
          maxRetryIntervalMs,
          sendChangesDebounceMs,
          createIfAbsent: true,
          initialValue,
          initialStaticValue,
          ...replicaOptions,
          storage: new TestStorage(),
        });

        replicas.push(replica);
      }
    });

    beforeAll(() => {
      replicas.forEach((replica) => {
        subscriptions.push(
          replica.observable.subscribe(() => {
            // do nothing
          })
        );
      });
    });

    beforeAll(() => {
      websocketServer = new WebSocketServer('ws://localhost:3333/ws');
      deciWebsocketServer = createWebsocketServer();
      websocketServer.on('connection', deciWebsocketServer.socketHandler);

      fetch.mockIf(
        () => true,
        syncApiServer(deciWebsocketServer, { fetchPrefix, maxTinyTimeout })
      );
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

    afterAll(() => {
      for (const subscription of subscriptions) {
        subscription.unsubscribe();
      }
    });

    afterAll((done) => {
      websocketServer.stop(done);
    });

    it('can send and receive extraneous websocket messages', (done) => {
      const sync = globalSyncs[0];
      const WebsocketClass = sync.websocketImpl();
      const websocket = new WebsocketClass('bogus url');
      websocket.onopen = (event: Event) => {
        expect(event).toBeDefined();
        expect(websocket.binaryType).toBe('blob');
        expect(websocket.extensions).toBe(undefined);
        expect(websocket.protocol).toBe('thisisagreattokenjustforyou');
        expect(websocket.url).toBe('ws://localhost:3333/ws');

        websocket.onclose = () => done();

        websocket.onmessage = (event: MessageEvent) => {
          const m = JSON.parse(event.data.toString());
          expect(m).toMatchObject({ type: 'pong' });
          websocket.close();
        };
        done();
      };

      websocket.send(JSON.stringify({ type: 'ping' }));

      expect(websocket.readyState).toBe(WebSocket.CONNECTING);
    });

    it('tracks observed changes', () => {
      // Create a side-channel where we watch remote and local changes
      replicas.forEach((replica, replicaIndex) => {
        replica.observable.subscribe(({ loading, error, data }) => {
          if (error) {
            throw error;
          }
          if (!loading) {
            replicaObservedValues[replicaIndex] = data;
          }
        });
      });
    });

    it('gets the replica contents', () => {
      const expectedValue = toJS(replicas[0].getValue());
      const expectedValues = replicas.map(() => toJS(expectedValue));
      const values = replicas.map((r) => toJS(r.getValue()));
      expect(values).toMatchObject(expectedValues);
    });

    it('makes random changes to the replicas', async () => {
      jest.useFakeTimers();
      await tickUntil(
        randomChangesToReplicas(replicas, randomChangeCountPerReplica),
        FAKE_TIME_TICK_MS
      );
    });

    // it('waits a bit', async () => await timeout(10000), 11000);

    it('all converges', async () => {
      jest.useFakeTimers();
      await tickUntil(
        waitForExpect(
          () => {
            const expectedValue = toJS(replicas[0].getValue());
            const expectedValues = replicas.map(() => toJS(expectedValue));
            const values = replicas.map((r) => toJS(r.getValue()));
            expect(values).toMatchObject(expectedValues);
          },
          30000,
          1000
        ),
        FAKE_TIME_TICK_MS
      );
    });

    it('observed values match', () => {
      const values = replicas.map((r) => toJS(r.getValue()));
      expect(values).toMatchObject(replicaObservedValues.map(toJS));
    });

    it("eventually, each replica's sync status is either remote changed or reconciled", async () => {
      const acceptableEndStatuses = [
        SyncStatus.RemoteChanged,
        SyncStatus.Reconciled,
      ];
      jest.useFakeTimers();
      await tickUntil(
        waitForExpect(() => {
          for (const replica of replicas) {
            expect(acceptableEndStatuses).toContainEqual(
              replica.syncStatus.getValue()
            );
          }
        }),
        FAKE_TIME_TICK_MS
      );
    });

    it("each replica's replication status is saved remotely", async () => {
      jest.useFakeTimers();
      await tickUntil(
        waitForExpect(() => {
          for (const replica of replicas) {
            expect(replica.replicationStatus).toBe(
              ReplicationStatus.SavedRemotely
            );
          }
        }),
        FAKE_TIME_TICK_MS
      );
    });
  });
});

async function randomChangesToReplicas(
  replicas: Replica<Model>[],
  changeCount: number
): Promise<void> {
  // random changes in all replicas happen in parallel
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
  const candidateNode = candidates[candidateIndex];
  const candidate = candidateNode.children[0].text;

  if (!candidate || candidate.length < 6) {
    return randomInsert(replica, candidateIndex);
  }

  const candidateOp = pickRandom([randomInsert, randomRemove, randomSplit]);

  candidateOp(replica, candidateIndex);
}

function randomInsert(replica: Replica<Model>, index: number) {
  replica.mutate((model) => {
    const text = model[index].children[0]?.text;
    const pos = pickRandomIndex(text);
    text!.insertAt!(pos, randomChar());
  });
}

function randomRemove(replica: Replica<Model>, index: number) {
  replica.mutate((model) => {
    const text = model[index].children[0].text;
    const pos = pickRandomIndex(text);
    text!.deleteAt!(pos);
  });
}

function randomSplit(replica: Replica<Model>, index: number) {
  replica.mutate((model) => {
    const node = model[index];
    const text = node.children[0].text;
    const pos = pickRandomIndex(text);
    const copy = cloneNode(node) as BaseNode;

    text.deleteAt!(pos, text.length - pos);
    if (pos > 0) {
      copy.children[0].text.deleteAt!(0, pos);
    }

    model.insertAt!(index + 1, copy);
  });
}

function randomSmallTimeout() {
  return timeout(Math.floor(Math.random() * maxSmallTimeout));
}

function randomMicroTimeout() {
  return timeout(Math.floor(Math.random() * maxMicroTimeout));
}

function pickRandom<T>(arr: Array<T>): T {
  const index = pickRandomIndex(arr);
  return arr[index];
}

function pickRandomIndex(arr: any[] | string): number {
  return Math.floor(Math.random() * arr.length);
}
