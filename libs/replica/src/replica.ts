import { Doc } from 'automerge';
import Automerge, { Diff, Change } from 'automerge';
import { Observable, Subscription, Subject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { dequal } from 'dequal';
import { fnQueue } from './utils/fn-queue';
import { toJS } from './utils/to-js';
import { Sync } from './sync';
import { ReplicaSync } from './replica-sync';
import { observeSubscriberCount } from './utils/observe-subscriber-count';
import { AsyncSubject, Mutation } from './types';
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
  private initialValue: T | null;
  private store: Store<{ value: T }>;

  private stopped = false;
  private queue = fnQueue();
  private doc: null | Doc<{ value: T }> = null;
  private needsFlush = false;
  private sync: ReplicaSync<T>;

  private subscriptionCountObservables: Subject<number>[] = [];
  private remoteDocSubscription: Subscription | null = null;
  private remoteChangesSubscription: Subscription | null = null;

  public observable = new Subject<AsyncSubject<T>>();
  public remoteChanges = new Subject<ChangeEvent<T>>();
  public localChanges = new Subject<Mutation<Doc<{ value: T }>>>();
  public subscriptionCountObservable: Observable<number>;

  constructor({
    name,
    actorId,
    userId,
    sync: globalSync,
    initialValue = null,
    createIfAbsent = false,
    initialStaticValue = null,
    startReplicaSync = true,
    maxRetryIntervalMs,
    sendChangesDebounceMs,
    fetchPrefix,
  }: ICreateReplicaOptions<T>) {
    this.userId = userId;
    this.initialValue = initialValue;

    this.store = new Store<{ value: T }>({
      key: `${this.userId}:${name}`,
      initialValue: initialValue == null ? null : { value: initialValue },
      initialStaticValue,
      actorId,
      createIfAbsent,
      onChange: this.onStoreChange.bind(this),
    });

    // Subscription count observeables
    this.subscriptionCountObservables.push(
      observeSubscriberCount(this.observable, () => {
        this.observable.next({ loading: true, error: null, data: null });

        try {
          this.doc = this.getDoc();
          if (this.doc !== null) {
            this.observable.next({
              loading: false,
              data: this.doc.value as T,
              error: null,
            });
          }
        } catch (err) {
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

    if (startReplicaSync) {
      this.startReplicaSync();
    }
  }

  public mutate(fn: (doc: T) => void | T): T | null {
    assert(!this.stopped, 'replica is stopped');

    const ldoc = this.getDoc();
    assert(ldoc, 'cannot mutate unexisting document');

    this.doc = Automerge.change(ldoc, (doc) => {
      const value = fn(doc.value);
      if (value !== undefined) {
        doc.value = value as T;
      }
      return doc;
    });
    this.needsFlush = true;
    this.observable.next({
      loading: false,
      error: null,
      data: this.doc.value as T,
    });
    this.localChanges.next({ before: ldoc, after: this.doc });
    return this.doc == null ? null : (this.doc.value as T);
  }

  public beforeRemoteChanges() {
    // nothing, this is here if the user needs to change it.
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
    this.queue
      .push(() => this.handleStorageEvent())
      .catch((err) => {
        console.error(err);
      });
  }

  private async handleStorageEvent() {
    if (!this.isActive()) {
      this.loadDoc();
      this.observable.next({
        loading: false,
        error: null,
        data: this.doc!.value as T,
      });
    } else {
      const newDoc = this.store.get();
      if (newDoc !== null) {
        this.mergeRemoteDoc(newDoc);
      }
    }
  }

  private async mergeRemoteDoc(remoteDoc: Doc<{ value: T }>) {
    await this.beforeRemoteChanges();
    const oldDoc = this.doc;
    if (oldDoc == null) {
      return;
    }

    try {
      const c = Automerge.getChanges(oldDoc!, remoteDoc);
      if (c.length > 0) {
        this.doc = Automerge.applyChanges(oldDoc!, c) as Doc<{ value: T }>;
        this.remoteChanges.next({
          diffs: Automerge.diff(oldDoc!, this.doc),
          doc: this.doc!,
          before: oldDoc!,
        });

        if (this.doc !== null) {
          this.observable.next({
            loading: false,
            error: null,
            data: this.doc.value as T,
          });
        }
      }

      if (oldDoc !== this.doc) {
        this.needsFlush = true;
        this.flush();
      }
    } catch (err) {
      if (!(err instanceof RangeError)) {
        throw err;
      }
      if (
        this.initialValue != null &&
        dequal(toJS(oldDoc), this.initialValue)
      ) {
        this.doc = remoteDoc;
        this.observable.next({
          loading: false,
          error: err,
          data: this.doc.value as T,
        });
      } else {
        this.observable.next({ loading: false, error: err, data: null });
      }
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

    this.loadDoc();

    if (this.doc !== null) {
      this.localChanges.next({ before: null, after: this.doc });
    }
  }
}
