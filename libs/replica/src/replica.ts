import { Doc } from 'automerge';
import Automerge, { Diff, Change } from 'automerge';
import {
  Observable,
  Subscription,
  Subject,
  BehaviorSubject,
  combineLatest,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { ReplicaStorage, ReplicationStatus } from '@decipad/interfaces';
import { fnQueue } from './utils/fn-queue';
import { Sync } from './sync';
import { ReplicaSync } from './replica-sync';
import { observeSubscriberCount } from './utils/observe-subscriber-count';
import { syncStatusToReplicationStatus } from './utils/sync-status-to-replication-status';
import { AsyncSubject, Mutation, SyncStatus } from './types';
import { Store } from './store';
import assert from 'assert';

export interface ICreateReplicaOptions<T> {
  name: string;
  actorId: string;
  userId: string;
  sync: Sync<T>;
  initialValue?: T | null;
  createIfAbsent?: boolean;
  initialStaticValue?: string | null;
  startReplicaSync?: boolean;
  maxRetryIntervalMs: number;
  sendChangesDebounceMs: number;
  fetchPrefix: string;
  useLocalStoreEvents?: boolean;
  beforeRemoteChanges?: () => Promise<void> | void;
  storage: ReplicaStorage;
}

export interface ChangeEvent<T> {
  diffs: Diff[];
  doc: Doc<{ value: T }>;
  before: Doc<{ value: T }>;
}

export function createReplica<T>(options: ICreateReplicaOptions<T>) {
  return new Replica(options);
}

export class Replica<T> {
  private userId: string;
  private store: Store<{ value: T }>;
  private useLocalStoreEvents: boolean;
  private beforeRemoteChanges: () => Promise<void> | void;

  private stopped = false;
  private queue = fnQueue();
  private doc: null | Doc<{ value: T }> = null;
  private needsFlush = false;
  private sync: ReplicaSync<T>;

  private subscriptionCountObservables: Subject<number>[] = [];
  private remoteDocSubscription: Subscription | null = null;
  private remoteChangesSubscription: Subscription | null = null;
  private replicationStatusSubscription: Subscription;

  public observable = new Subject<AsyncSubject<T>>();
  public remoteChanges = new Subject<ChangeEvent<T>>();
  public localChanges = new Subject<Mutation<Doc<{ value: T }>>>();
  public subscriptionCountObservable: Observable<number>;
  public syncStatus: BehaviorSubject<SyncStatus>;
  public replicationStatus: ReplicationStatus =
    ReplicationStatus.NeedsRemoteSave;

  constructor({
    name,
    actorId,
    userId,
    sync: globalSync,
    initialValue = null,
    createIfAbsent = false,
    useLocalStoreEvents = true,
    initialStaticValue = null,
    startReplicaSync = true,
    maxRetryIntervalMs,
    sendChangesDebounceMs,
    fetchPrefix,
    beforeRemoteChanges = () => {},
    storage,
  }: ICreateReplicaOptions<T>) {
    this.userId = userId;
    this.useLocalStoreEvents = useLocalStoreEvents;
    this.beforeRemoteChanges = beforeRemoteChanges;

    this.store = new Store<{ value: T }>({
      key: `${this.userId}:${name}`,
      initialValue: initialValue == null ? null : { value: initialValue },
      initialStaticValue,
      actorId,
      createIfAbsent,
      onChange: this.onStoreChange.bind(this),
      storage,
    });

    // Subscription count observeables
    this.subscriptionCountObservables.push(
      observeSubscriberCount(this.observable, () => {
        this.observable.next({ loading: true, error: null, data: null });

        try {
          const doc = this.getDoc();
          if (doc !== null) {
            this.observable.next({
              loading: false,
              data: doc.value as T,
              error: null,
            });
          }
        } catch (err) {
          console.error(err);
          this.observable.next({ loading: false, error: err, data: null });
          stop();
        }
      })
    );

    this.subscriptionCountObservables.push(
      observeSubscriberCount(this.remoteChanges)
    );
    const subscriptionCountObservable = (this.subscriptionCountObservable =
      combineLatest(...this.subscriptionCountObservables).pipe(
        map(([c1, c2]) => c1 + c2)
      ));

    let hadSubscriptors = false;
    this.subscriptionCountObservable.subscribe((subscriptionCount) => {
      if (subscriptionCount > 0) {
        hadSubscriptors = true;
      } else if (hadSubscriptors) {
        this.flush();
        this.doc = null;
        hadSubscriptors = false;
      }
    });

    // Sync

    this.sync = new ReplicaSync<T>({
      topic: name,
      sync: globalSync,
      localChangesObservable: this.localChanges,
      subscriptionCountObservable,
      start: startReplicaSync,
      maxRetryIntervalMs,
      sendChangesDebounceMs,
      fetchPrefix,
    });

    this.syncStatus = this.sync.syncStatus;

    // Update store with replication status so it knows
    // which elements to evict if it needs to.
    const replicationStatus$ = syncStatusToReplicationStatus(this.syncStatus);
    this.replicationStatusSubscription = replicationStatus$.subscribe(
      (status) => {
        this.replicationStatus = status;
      }
    );
    this.store.setReplicationStatus(replicationStatus$);

    if (startReplicaSync) {
      this.startReplicaSync();
    }

    this.loadDoc();

    if (this.doc !== null) {
      this.localChanges.next({ before: null, after: this.doc });
    }
  }

  public mutate(fn: (doc: T) => void | T) {
    assert(!this.stopped, 'replica is stopped');

    const ldoc = this.getDoc();
    assert(ldoc, 'cannot mutate unexisting document');

    this.doc = Automerge.change(ldoc, (doc) => {
      const ret = fn(doc.value);
      if (ret !== undefined) {
        doc.value = ret;
      }
    });
    this.needsFlush = true;
    this.observable.next({
      loading: false,
      error: null,
      data: this.doc.value as T,
    });
    this.localChanges.next({ before: ldoc, after: this.doc });
  }

  public flush() {
    if (!this.needsFlush) {
      return;
    }
    if (!this.doc) {
      return;
    }
    this.needsFlush = false;
    this.store.put(this.doc);
  }

  public stop() {
    this.stopped = true;
    this.remoteDocSubscription?.unsubscribe();
    this.remoteChangesSubscription?.unsubscribe();
    this.replicationStatusSubscription.unsubscribe();
    this.sync.stop();
    this.observable.complete();
    this.remoteChanges.complete();
    this.localChanges.complete();
    for (const obs of this.subscriptionCountObservables) {
      obs.complete();
    }
    this.store.stop();
  }

  public remove() {
    this.store.delete();
    this.observable.next({ loading: false, error: null, data: null });
    stop();
  }

  public getValue(): T | null {
    const doc = this.getDoc();
    return doc == null ? null : (doc?.value as T);
  }

  private loadDoc() {
    this.doc = this.store.get();
  }

  private getDoc(): Doc<{ value: T }> | null {
    if (this.doc == null) {
      this.loadDoc();
    }

    return this.doc;
  }

  private isActive(): boolean {
    return !this.stopped && this.doc !== null;
  }

  private onStoreChange() {
    if (this.useLocalStoreEvents) {
      this.queue
        .push(() => this.handleStoreChange())
        .catch((err) => {
          console.error(err);
        });
    }
  }

  private async handleStoreChange() {
    if (!this.isActive() && !this.stopped) {
      this.loadDoc();
      this.observable.next({
        loading: false,
        error: null,
        data: this.doc!.value as T,
      });
    } else {
      const doc = this.store.get();
      if (doc) {
        this.mergeLocalDoc(doc);
      }
    }
  }

  private async mergeLocalDoc(localDoc: Doc<{ value: T }>) {
    await this.beforeRemoteChanges();
    let hasChanges = false;
    const oldDoc = this.doc;
    if (oldDoc == null) {
      hasChanges = true;
      this.doc = localDoc;
    } else {
      let newDoc;
      try {
        newDoc = Automerge.merge(oldDoc, localDoc);
      } catch (err) {
        if (!(err instanceof RangeError)) {
          console.error(err);
        }
        newDoc = localDoc;
      }
      const c = Automerge.getChanges(oldDoc, newDoc);
      if (c.length > 0) {
        hasChanges = true;
        this.doc = Automerge.applyChanges(oldDoc!, c) as Doc<{ value: T }>;
        this.remoteChanges.next({
          diffs: Automerge.diff(oldDoc!, this.doc),
          doc: this.doc!,
          before: oldDoc!,
        });
      }
    }

    if (this.doc !== null && hasChanges) {
      this.observable.next({
        loading: false,
        error: null,
        data: this.doc.value as T,
      });
    }

    if (hasChanges) {
      this.needsFlush = true;
      this.flush();
    }
  }

  private async mergeRemoteDoc(remoteDoc: Doc<{ value: T }>) {
    await this.beforeRemoteChanges();
    const oldDoc = this.doc;
    let hasChanges = false;
    if (oldDoc == null) {
      hasChanges = true;
      this.doc = remoteDoc;
    } else {
      const newDoc = Automerge.merge(oldDoc, remoteDoc);
      this.doc = newDoc;
      const c = Automerge.getChanges(oldDoc, newDoc);
      if (c.length > 0) {
        hasChanges = true;
        this.remoteChanges.next({
          diffs: Automerge.diff(oldDoc!, newDoc),
          doc: this.doc!,
          before: oldDoc!,
        });
      }
    }

    if (this.doc !== null && hasChanges) {
      this.observable.next({
        loading: false,
        error: null,
        data: this.doc.value as T,
      });
    }

    if (hasChanges) {
      this.needsFlush = true;
      this.flush();
    }
  }

  private startReplicaSync() {
    this.remoteDocSubscription = this.sync.remoteDoc.subscribe((doc2) => {
      const doc1 = this.getDoc();
      if (doc1 == null) {
        this.doc = doc2;
        this.observable.next({
          loading: false,
          error: null,
          data: this.doc!.value as T,
        });
        this.needsFlush = true;
        this.flush();
      } else {
        this.queue
          .push(() => this.mergeRemoteDoc(doc2))
          .catch((err) => {
            console.error(err);
          });
      }
    });

    this.remoteChangesSubscription = this.sync.remoteChanges.subscribe(
      (changes: Change[]) => {
        this.queue
          .push(async () => {
            await this.beforeRemoteChanges();
            const oldDoc = this.getDoc();
            this.doc = Automerge.applyChanges(oldDoc!, changes);

            const diffs = Automerge.diff(oldDoc!, this.doc);
            this.remoteChanges.next({ before: oldDoc!, doc: this.doc, diffs });
            this.observable.next({
              loading: false,
              error: null,
              data: this.doc.value as T,
            });
            this.needsFlush = true;
            this.flush();
          })
          .catch((err) => {
            console.error(err);
          });
      }
    );
  }
}
