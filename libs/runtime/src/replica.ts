import { Doc } from 'automerge';
import Automerge, { Diff, Change } from 'automerge';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { dequal } from 'dequal';
import { Runtime } from './runtime';
import { fnQueue } from './utils/fn-queue';
import { toJS } from './utils/to-js';
import { ReplicaSync } from './replica-sync';
import { observeSubscriberCount } from './utils/observe-subscriber-count';

function createReplica<T>(
  name: string,
  runtime: Runtime,
  initialValue: T | null = null,
  createIfAbsent = false,
  initialStaticValue: string | null = null
): Replica<T> {
  let stopped = false;
  const queue = fnQueue();
  let doc: null | Doc<{ value: T }> = null;
  const observable = new Subject<AsyncSubject<T>>();
  let needsFlush = false;

  const remoteChanges = new Subject<ChangeEvent<T>>();
  const localChanges = new Subject<Mutation<Doc<{ value: T }>>>();

  window.addEventListener('storage', onStorageEvent);

  // Subscription count observeables

  const subscriptionCountObservable1 = observeSubscriberCount(
    observable,
    () => {
      observable.next({ loading: true, error: null, data: null });

      try {
        doc = getDoc();
        if (doc !== null) {
          observable.next({
            loading: false,
            data: doc.value as T,
            error: null,
          });
        }
      } catch (err) {
        observable.next({ loading: false, error: err, data: null });
        stop();
      }
    }
  );

  const subscriptionCountObservable2 = observeSubscriberCount(remoteChanges);

  const subscriptionCountObservable = combineLatest(
    subscriptionCountObservable1,
    subscriptionCountObservable2
  ).pipe(map(([c1, c2]) => c1 + c2));

  let hadSubscriptors = false;
  subscriptionCountObservable.subscribe((subscriptionCount) => {
    if (subscriptionCount > 0) {
      hadSubscriptors = true;
    } else if (hadSubscriptors) {
      flush();
      doc = null;
      hadSubscriptors = false;
    }
  });

  // sync

  const sync = new ReplicaSync(
    name,
    runtime,
    localChanges,
    subscriptionCountObservable
  );
  const remoteDocSubscription = sync.remoteDoc.subscribe((doc2) => {
    const doc1 = getDoc();
    if (doc1 === null) {
      doc = doc2;
      observable.next({ loading: false, error: null, data: doc!.value as T });
      needsFlush = true;
      flush();
    } else {
      queue.push(() => mergeRemoteDoc(doc2));
    }
  });

  const remoteChangesSubscription = sync.remoteChanges.subscribe(
    (changes: Change[]) => {
      queue.push(async () => {
        await self.beforeRemoteChanges();
        const oldDoc = getDoc();
        if (oldDoc === null) {
          throw new Error('Could not get doc from local storage');
        }
        doc = Automerge.applyChanges(oldDoc, changes);

        const diffs = Automerge.diff(oldDoc, doc);
        remoteChanges.next({ before: oldDoc, doc, diffs });
        observable.next({ loading: false, error: null, data: doc.value as T });
        needsFlush = true;
        flush();
      });
    }
  );

  loadDoc();

  if (doc !== null) {
    localChanges.next({ before: null, after: doc });
  }

  // exported interface

  const self = {
    mutate,
    observable,
    remoteChanges,
    localChanges,
    flush,
    remove,
    getValue,
    stop,
    isActive,
    isOnlyRemote,
    subscriptionCountObservable,
    /* eslint-disable @typescript-eslint/no-empty-function */
    beforeRemoteChanges: () => {},
  };

  return self;

  function mutate(fn: (doc: T) => void | T): T | null {
    assertNotStopped();
    const ldoc = getDoc();
    if (ldoc === null) {
      throw new Error('cannot mutate unexisting document');
    }
    doc = Automerge.change(ldoc, (doc) => {
      const value = fn(doc.value as T);
      if (value !== undefined) {
        doc.value = value as T;
      }
      return doc;
    });
    needsFlush = true;
    observable.next({ loading: false, error: null, data: doc.value as T });
    localChanges.next({ before: ldoc, after: doc });
    return doc === null ? null : (doc.value as T);
  }

  function flush() {
    if (!needsFlush) {
      return;
    }
    if (!doc) {
      return;
    }
    window.localStorage.setItem(key(), Automerge.save(doc));

    needsFlush = false;
  }

  function stop() {
    stopped = true;
    remoteDocSubscription.unsubscribe();
    remoteChangesSubscription.unsubscribe();
    sync.stop();
    observable.complete();
    remoteChanges.complete();
    localChanges.complete();
    window.removeEventListener('storage', onStorageEvent);
    subscriptionCountObservable1.complete();
    subscriptionCountObservable2.complete();
  }

  function remove() {
    window.localStorage.removeItem(key());
    observable.next({ loading: false, error: null, data: null });
    stop();
  }

  function getValue(): T | null {
    const doc = getDoc();
    return doc === null ? null : (doc?.value as T);
  }

  function loadDoc() {
    const str = window.localStorage.getItem(key()) || initialStaticValue;
    if (str !== null) {
      doc = Automerge.load(str, runtime.actorId);
    } else if (createIfAbsent) {
      doc = Automerge.from({ value: initialValue }, 'starter') as Doc<{
        value: T;
      }>;
    }
    if (doc) {
      const toBeSaved = Automerge.save(doc);
      if (toBeSaved !== str) {
        window.localStorage.setItem(key(), toBeSaved);
      }
    }
  }

  function getDocFromLocalStorage(): Doc<{ value: T }> | null {
    const str = window.localStorage.getItem(key());
    if (str !== null) {
      return Automerge.load(str, runtime.actorId) as Doc<{ value: T }>;
    }
    return null;
  }

  function getDoc(): Doc<{ value: T }> | null {
    if (doc === null) {
      loadDoc();
    }

    return doc;
  }

  function key(): string {
    return `${runtime.userId}:${name}`;
  }

  function isActive(): boolean {
    return doc !== null;
  }

  function isOnlyRemote(): boolean {
    return !createIfAbsent && doc === null;
  }

  function onStorageEvent(event: StorageEvent) {
    if (event.key !== key()) {
      return;
    }
    queue.push(() => handleStorageEvent());
  }

  async function handleStorageEvent() {
    if (!isActive()) {
      loadDoc();
      observable.next({ loading: false, error: null, data: doc!.value as T });
    } else {
      const newDoc = getDocFromLocalStorage();
      if (newDoc !== null) {
        mergeRemoteDoc(newDoc);
      }
    }
  }

  async function mergeRemoteDoc(
    remoteDoc: Doc<{ value: T }>,
    fromError = false
  ) {
    await self.beforeRemoteChanges();
    const oldDoc = doc;
    try {
      const c = Automerge.getChanges(oldDoc!, remoteDoc);
      if (c.length > 0) {
        doc = Automerge.applyChanges(oldDoc!, c) as Doc<{ value: T }>;
        remoteChanges.next({
          diffs: Automerge.diff(oldDoc!, doc),
          doc: doc!,
          before: oldDoc!,
        });

        observable.next({ loading: false, error: null, data: doc!.value as T });
      }
      if (oldDoc !== doc) {
        needsFlush = true;
        flush();
      }
    } catch (err) {
      if (!fromError && dequal(toJS(oldDoc), initialValue)) {
        await mergeRemoteDoc(remoteDoc, true);
      } else {
        observable.next({ loading: false, error: err, data: null });
      }
    }
  }

  function assertNotStopped() {
    if (stopped) {
      throw new Error('replica is stopped');
    }
  }
}

interface ChangeEvent<T> {
  diffs: Diff[];
  doc: Doc<{ value: T }>;
  before: Doc<{ value: T }>;
}

interface Replica<T> {
  mutate: (fn: (doc: T) => void | T) => T | null;
  observable: Observable<AsyncSubject<T>>;
  remoteChanges: Observable<ChangeEvent<T>>;
  localChanges: Observable<Mutation<Doc<{ value: T }>>>;
  flush: () => void;
  remove: () => void;
  getValue: () => T | null;
  stop: () => void;
  isActive: () => boolean;
  isOnlyRemote: () => boolean;
  subscriptionCountObservable: Observable<number>;
  beforeRemoteChanges: (() => void) | null;
}

export { createReplica, Replica };
