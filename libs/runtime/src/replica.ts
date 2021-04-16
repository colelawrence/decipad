import { Doc } from 'automerge';
import Automerge, { Diff } from 'automerge';
import {
  Observable,
  Subject
} from 'rxjs';
import { dequal } from 'dequal';
import { fnQueue } from './utils/fn-queue';
import { toJS } from './utils/to-js';
import { observeSubscriberCount } from './utils/observe-subscriber-count';

function createReplica<T>(
  name: string,
  userId: string,
  actorId: string,
  initialValue: T | null = null
): Replica<T> {
  let stopped = false
  const queue = fnQueue();
  let doc: null | Doc<{ value: T }> = null;
  const observable = new Subject<AsyncSubject<T>>();
  let needsFlush = false;

  const subscriptionCountObservable = observeSubscriberCount(observable, () => {
    observable.next({ loading: true, error: null, data: null });

    try {
      doc = getDoc();
      observable.next({ loading: false, data: doc.value as T, error: null });
    } catch (err) {
      observable.next({ loading: false, error: err, data: null });
      observable.complete();
    }
  })

  let hadSubscriptors = false;
  subscriptionCountObservable.subscribe((subscriptionCount) => {
    if (subscriptionCount > 0) {
      hadSubscriptors = true
    } else if (hadSubscriptors) {
      doc = null;
      hadSubscriptors = false;
    }
  })

  const changes = new Subject<ChangeEvent<T>>();

  window.addEventListener('storage', onStorageEvent);

  const self = {
    mutate,
    observable,
    changes,
    flush,
    remove,
    getValue,
    stop,
    isActive,
    subscriptionCountObservable,
    /* eslint-disable @typescript-eslint/no-empty-function */
    beforeRemoteChanges: () => {},
  };

  return self;

  function mutate(fn: (doc: T) => void | T): T | null {
    assertNotStopped();
    const ldoc = getDoc();
    doc = Automerge.change(ldoc, (doc) => {
      const value = fn(doc.value as T);
      if (value !== undefined) {
        doc.value = value as T;
      }
      return doc;
    });
    needsFlush = true;
    observable.next({ loading: false, error: null, data: doc.value as T });
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
    stopped = true
    observable.complete();
    subscriptionCountObservable.complete();
    window.removeEventListener('storage', onStorageEvent);
  }

  function remove() {
    window.localStorage.removeItem(key());
    observable.next({ loading: false, error: null, data: null });
    observable.complete();
  }

  function getValue(): T {
    return getDoc().value as T;
  }

  function loadDoc() {
    const str = window.localStorage.getItem(key());
    if (str) {
      doc = Automerge.load(str, actorId);
    } else {
      doc = Automerge.from({ value: initialValue }, 'starter') as Doc<{
        value: T;
      }>;
      window.localStorage.setItem(key(), Automerge.save(doc));
    }
  }

  function getDoc(): Doc<{ value: T }> {
    if (doc === null) {
      loadDoc();
    }
    if (doc === null) {
      throw new Error('doc should exist');
    }

    return doc;
  }

  function key(): string {
    return `${userId}:${name}`;
  }

  function isActive(): boolean {
    return doc !== null;
  }

  function onStorageEvent(event: StorageEvent) {
    if (event.key !== key()) {
      return;
    }
    queue.push(() => handleStorageEvent());
  }

  async function handleStorageEvent(fromError = false) {
    console.log('handleStorageEvent')
    if (!isActive()) {
      loadDoc();
      observable.next({ loading: false, error: null, data: doc!.value as T });
    } else {
      await self.beforeRemoteChanges();
      const oldDoc = doc;
      loadDoc();
      try {
        const newDoc = doc;
        const c = Automerge.getChanges(oldDoc!, newDoc!);
        if (c.length > 0) {
          doc = Automerge.applyChanges(oldDoc!, c) as Doc<{ value: T }>;
          changes.next({
            diffs: Automerge.diff(oldDoc!, doc),
            doc: doc!,
            before: oldDoc!,
          });
        }
        observable.next({ loading: false, error: null, data: doc!.value as T });
      } catch (err) {
        if (!fromError && dequal(toJS(oldDoc), initialValue)) {
          await handleStorageEvent(true);
        } else {
          observable.next({ loading: false, error: null, data: doc!.value as T });
        }
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
  changes: Observable<ChangeEvent<T>>;
  flush: () => void;
  remove: () => void;
  getValue: () => T;
  stop: () => void;
  isActive: () => boolean;
  subscriptionCountObservable: Observable<number>;
  beforeRemoteChanges: (() => void) | null;
}

export { createReplica, Replica };
