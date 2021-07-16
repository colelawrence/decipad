import { Observable, Subscription, Subject, BehaviorSubject } from 'rxjs';
import Automerge, { Change, Doc } from 'automerge';
import debounce from 'lodash.debounce';
import { Sync } from './sync';
import { Mutation, RemoteOp, SyncStatus } from './types';

export type { Mutation };

export class ReplicaSync<T> {
  public syncStatus = new BehaviorSubject<SyncStatus>(SyncStatus.Unknown);

  private maxRetryIntervalMs: number;
  private sendChangesDebounceMs: number;
  private fetchPrefix: string;

  private topic: string;
  private sync: Sync<T>;
  private localChangesObservable: Observable<Mutation<Doc<{ value: T }>>>;
  private subscriptionCountObservable: Observable<number>;

  private subscriptionCountSubscription: Subscription | null = null;
  private localChangesSubscription: Subscription | null = null;
  private remoteOpsSubscription: Subscription | null = null;
  private subscribedPromise: Promise<void> | null = null;
  private debouncedTryReconcile: { (): void; cancel: () => void };
  public remoteChanges: Subject<Change[]> = new Subject<Change[]>();
  public remoteDoc: Subject<Doc<{ value: T }>> = new Subject<
    Doc<{ value: T }>
  >();
  private latest: Doc<{ value: T }> | null = null;
  private stopped = false;
  private lastFromRemote: Doc<{ value: T }> | null = null;
  private lastSentChangeCount = Infinity;
  private reconciling = false;
  private needsReconcile = true;
  private recoveringReconcile = false;

  constructor({
    maxRetryIntervalMs,
    sendChangesDebounceMs,
    fetchPrefix,
    topic,
    sync,
    localChangesObservable,
    subscriptionCountObservable,
    start,
  }: {
    maxRetryIntervalMs: number;
    sendChangesDebounceMs: number;
    fetchPrefix: string;
    topic: string;
    sync: Sync<T>;
    localChangesObservable: Observable<Mutation<Doc<{ value: T }>>>;
    subscriptionCountObservable: Observable<number>;
    start: boolean;
  }) {
    this.maxRetryIntervalMs = maxRetryIntervalMs;
    this.sendChangesDebounceMs = sendChangesDebounceMs;
    this.fetchPrefix = fetchPrefix;
    this.topic = topic;

    this.sync = sync;
    this.localChangesObservable = localChangesObservable;
    this.subscriptionCountObservable = subscriptionCountObservable;

    this.debouncedTryReconcile = debounce(
      this.tryReconcile.bind(this),
      this.sendChangesDebounceMs
    );

    if (start) {
      this.start();
    }
  }

  public start() {
    this.subscriptionCountSubscription =
      this.subscriptionCountObservable.subscribe((observerCount) => {
        if (observerCount === 0) {
          this.unsubscribe();
        } else if (observerCount > 0) {
          this.subscribe();
        }
      });

    this.localChangesSubscription = this.localChangesObservable.subscribe(
      ({ after }) => {
        if (after === this.latest) {
          return;
        }
        this.latest = after;

        this.syncStatus.next(SyncStatus.LocalChanged);
        this.needsReconcile = true;
        this.debouncedTryReconcile();
      }
    );

    this.tryReconcile();
  }

  public stop() {
    this.subscriptionCountSubscription?.unsubscribe();
    this.localChangesSubscription?.unsubscribe();
    if (this.remoteOpsSubscription !== null) {
      this.remoteOpsSubscription.unsubscribe();
    }
    this.unsubscribe();

    this.remoteChanges.complete();
    this.remoteDoc.complete();
    this.debouncedTryReconcile.cancel();
    this.tryReconcile()
      .catch(() => {
        // ignore
      })
      .finally(() => {
        this.stopped = true;
        this.lastFromRemote = null;
        this.syncStatus.complete();
      }); // One last attempt
  }

  private subscribe(): Promise<void> {
    if (this.subscribedPromise) {
      return this.subscribedPromise;
    }
    this.subscribedPromise = new Promise((resolve) => {
      // TODO: Have a timeout and perhaps reject subscribe call?
      const remoteOpsObservable = this.sync.subscribe(
        this.topic,
        this.localChangesObservable
      );
      this.remoteOpsSubscription = remoteOpsObservable.subscribe(
        (remoteOp: RemoteOp) => {
          switch (remoteOp.op) {
            case 'subscribed':
              resolve();
              break;

            case 'unsubscribed':
              if (this.remoteOpsSubscription !== null) {
                this.remoteOpsSubscription.unsubscribe();
                this.remoteOpsSubscription = null;
              }
              break;

            case 'changed':
              try {
                this.integrateRemoteChanges(remoteOp.changes!);
              } catch (err) {
                console.error(err);
                this.needsReconcile = true;
                this.tryReconcile();
              }
          }
        }
      );
    });

    return this.subscribedPromise;
  }

  private async unsubscribe() {
    if (!this.subscribedPromise) {
      return;
    }
    this.sync.unsubscribe(this.topic, this.localChangesObservable);
    this.subscribedPromise = null;
  }

  private async tryReconcile(): Promise<void> {
    if (this.reconciling || this.recoveringReconcile || !this.needsReconcile) {
      return;
    }

    try {
      this.reconciling = true;
      this.syncStatus.next(SyncStatus.Reconciling);
      await this.subscribe();
      this.needsReconcile = false;
      await this.reconcile();
      this.reconciling = false;
      this.syncStatus.next(SyncStatus.Reconciled);
      if (!this.stopped && this.needsReconcile) {
        this.tryReconcile();
      }
    } catch (err) {
      this.syncStatus.next(SyncStatus.Errored);
      this.reconciling = false;
      if (!this.stopped && !this.recoveringReconcile) {
        if (!(err instanceof RangeError)) {
          // do not print merge errors
          console.error(err);
        }
        this.scheduleRecoverReconcile();
      }
    }
  }

  private async scheduleRecoverReconcile() {
    this.recoveringReconcile = true;
    setTimeout(() => this.recoverReconcile(), this.randomRetryTimeout());
  }

  private async recoverReconcile() {
    this.recoveringReconcile = true;
    try {
      this.syncStatus.next(SyncStatus.Reconciling);
      await this.subscribe();
      this.needsReconcile = false;
      await this.reconcile();
      this.recoveringReconcile = false;
      this.reconciling = false;
      this.syncStatus.next(SyncStatus.Reconciled);
      if (!this.stopped && this.needsReconcile) {
        this.tryReconcile();
      }
    } catch (err) {
      if (!(err instanceof RangeError)) {
        console.error(err);
      }

      this.syncStatus.next(SyncStatus.Errored);
      this.scheduleRecoverReconcile();
    }
  }

  private async reconcile() {
    let error: Error | null = null;
    do {
      error = null;
      try {
        await this.attemptSendChanges();
      } catch (err) {
        error = err;
      }

      try {
        await this.attemptFetchFromRemote();
      } catch (err) {
        error = err;
      }

      try {
        await this.attemptSendChanges();
      } catch (err) {
        error = err;
      }
    } while (!error && this.lastSentChangeCount > 0);
    if (error) {
      throw error;
    }
  }

  private async attemptSendChanges() {
    if (this.stopped || this.latest === null) {
      if (!this.stopped) {
        throw new Error('nothing to send');
      }
    }
    if (this.lastFromRemote === null) {
      await this.attemptSendEverything();
    } else {
      await this.attempSendOnlyChanges();
    }
  }

  private async attempSendOnlyChanges() {
    const lastRemoteDoc = this.lastFromRemote!;
    let newRemoteDoc;
    try {
      newRemoteDoc = Automerge.merge(this.latest!, lastRemoteDoc);
    } catch (err) {
      console.error(err);
      newRemoteDoc = lastRemoteDoc;
    }
    const changes = Automerge.getChanges(lastRemoteDoc, newRemoteDoc);

    if (changes.length > 0) {
      const response = await fetch(this.remoteUrl() + '/changes', {
        method: 'PUT',
        body: JSON.stringify(changes),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });

      if (!response.ok) {
        const message = `Failed to send data to remote: ${
          response.status
        } - ${await response.text()}`;
        throw new Error(message);
      }
    }
    this.lastSentChangeCount = changes.length;
    // this.lastFromRemote = newRemoteDoc;
  }

  private async attemptSendEverything() {
    const latest = this.latest!;
    const response = await fetch(this.remoteUrl(), {
      method: 'PUT',
      body: Automerge.save(latest),
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      const message = `Failed to send data to remote: ${await response.text()}`;
      throw new Error(message);
    }
    // this.lastFromRemote = latest;
    this.lastSentChangeCount = 0; // should be Infinity
  }

  async attemptFetchFromRemote() {
    if (this.stopped) {
      throw new Error('stopped');
    }
    const resp = await fetch(this.remoteUrl());
    if (!resp.ok) {
      throw new Error(
        'response was not ok: ' + resp.status + ': ' + (await resp.text())
      );
    }
    const doc = await resp.text();
    if (doc.length > 0) {
      const remoteDoc = Automerge.load(doc) as Doc<{ value: T }>;
      this.lastFromRemote = remoteDoc;
      this.remoteDoc.next(remoteDoc);
    }
  }

  private integrateRemoteChanges(changes: Change[]) {
    if (changes.length > 0) {
      if (this.lastFromRemote !== null) {
        this.lastFromRemote = Automerge.applyChanges(
          this.lastFromRemote,
          changes
        );
        this.syncStatus.next(SyncStatus.RemoteChanged);
      } else {
        this.needsReconcile = true;
      }
      this.tryReconcile();
      this.remoteChanges.next(changes);
    }
  }

  private remoteUrl(): string {
    return this.fetchPrefix + '/api/syncdoc/' + encode(this.topic);
  }

  private randomRetryTimeout() {
    return Math.ceil(Math.random() * this.maxRetryIntervalMs);
  }
}

// apparently AWS API Gateway does not allow some characters as part of the id
// or it's an architect problem... not sure...
// anyway, we need to replace "/" characters with ":".
function encode(uri: string): string {
  let ret = uri.replace(/\//g, ':');
  if (ret[0] !== ':') {
    ret = ':' + ret;
  }
  return ret;
}
