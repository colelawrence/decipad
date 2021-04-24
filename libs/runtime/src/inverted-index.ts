import { Observable, BehaviorSubject, from } from 'rxjs';
import { Runtime } from './runtime';
import { createReplica, Replica } from './replica';
import { fnQueue } from './utils/fn-queue';
import { uri } from './utils/uri';

export function invertedIndex<T extends Identifiable>(
  name: string,
  runtime: Runtime,
  changeObservable: Observable<Mutation<T>>,
  extract: (o: T) => string[]
  ): InvertedIndex {
  const replicaByKey: Map<string, Replica<Id[]>> = new Map();
  const keysSubject = new BehaviorSubject<string[]>([]);
  const queue = fnQueue();

  const subscription = changeObservable.subscribe(({ before, after }) => {
    queue.push(async () => {
      const keysBefore = before !== null ? extract(before) : [];
      const keysAfter = after !== null ? extract(after) : [];

      const id = before !== null ? before.id : after !== null ? after.id : null;
      if (id === null) {
        return
      }
      for (const key of (keysAfter || [])) {
        const index = keysBefore.indexOf(key);
        if (index < 0) {
          await ensureEntry(key, id);
        }
        keysBefore.splice(index, 1);
      }
      for (const removeKey of (keysBefore || [])) {
        await removeEntry(removeKey, id);
      }
      keysSubject.next(Array.from(replicaByKey.keys()).sort());
    })
  })

  function keys(): Observable<Id[]> {
    return keysSubject;
  }

  function get(key: string): Observable<AsyncSubject<Id[]>> {
    if (!replicaByKey.has(key)) {
      return from([{ loading: true, error: null, data: null}, { loading: false, error: null, data: []}]);
    }
    return replicaByKey.get(key)!.observable;
  }

  async function ensureEntry(key: string, id: Id) {
    const replica = getReplicaForKey(key);
    replica.mutate((ids) => {
      if (ids.indexOf(id) < 0) {
        ids.push(id);
      }
    })
    await replica.flush(); // TODO: do not save index every time we make a change
  }

  async function removeEntry(key: string, id: Id) {
    const replica = getReplicaForKey(key);
    const result = replica.mutate((ids) => {
      const index = ids.indexOf(id);
      ids.splice(index, 1);
    })
    if (result!.length === 0) {
      replicaByKey.delete(key);
      await replica.remove();
    } else {
      await replica.flush() // TODO: do not save index every time we make a change
    }
  }

  function getReplicaForKey(key: string): Replica<Id[]> {
    let replica: Replica<Id[]> | undefined = replicaByKey.get(key);
    if (replica === undefined) {
      replica = createReplica<Id[]>(uri(name, key), runtime, [], true);
      replicaByKey.set(key, replica);
    }
    return replica;
  }

  function stop() {
    subscription.unsubscribe();
    for (const replica of replicaByKey.values()) {
      replica.stop();
    }
    replicaByKey.clear();
  }

  return {
    keys,
    get,
    stop
  };
}

export interface InvertedIndex {
  keys(): Observable<Id[]>
  get(key: string): Observable<AsyncSubject<Id[]>>
  stop(): void
}