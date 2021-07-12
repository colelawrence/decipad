import { Observable, Subscription, Subject } from 'rxjs';
import Automerge, { Change, Doc } from 'automerge';
import debounce from 'lodash.debounce';
import { Sync } from './sync';
import { fnQueue } from './utils/fn-queue';
import { encode } from './utils/resource';
import { Mutation, RemoteOp } from './types';

export type { Mutation };

export class ReplicaSync<T> {
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
  private subscribed = false;
  private debouncedSendChanges: { (): void; cancel: () => void };
  public remoteChanges: Subject<Change[]> = new Subject<Change[]>();
  public remoteDoc: Subject<Doc<{ value: T }>> = new Subject<
    Doc<{ value: T }>
  >();
  private latest: Doc<{ value: T }> | null = null;
  private queue = fnQueue();
  private stopped = false;
  private lastFromRemote: Doc<{ value: T }> | null = null;
  private lastSentChangeCount = Infinity;

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

    this.sendChanges = this.sendChanges.bind(this);
    this.debouncedSendChanges = debounce(
      this.sendChanges,
      this.sendChangesDebounceMs
    );

    if (start) {
      this.start();
    }
  }

  start() {
    this.subscriptionCountSubscription =
      this.subscriptionCountObservable.subscribe((observerCount) => {
        if (observerCount === 0) {
          this.queue
            .push(() => this.unsubscribe())
            .catch((err) => {
              console.error(err);
            });
        } else if (observerCount > 0) {
          this.queue
            .push(() => this.subscribe())
            .catch((err) => {
              console.error(err);
            });
        }
      });

    this.localChangesSubscription = this.localChangesObservable.subscribe(
      ({ after }) => {
        this.latest = after;
        this.debouncedSendChanges();
      }
    );

    this.fetch();
    this.sendChanges();
  }

  private subscribe(): Promise<void> {
    return new Promise((resolve) => {
      // TODO: Have a timeout and perhaps reject subscribe call?
      if (this.subscribed) {
        resolve();
        return;
      }

      const remoteOpsObservable = this.sync.subscribe(
        this.topic,
        this.localChangesObservable
      );
      this.remoteOpsSubscription = remoteOpsObservable.subscribe(
        (remoteOp: RemoteOp) => {
          switch (remoteOp.op) {
            case 'subscribed':
              this.subscribed = true;
              resolve();
              break;

            case 'unsubscribed':
              this.subscribed = false;
              if (this.remoteOpsSubscription !== null) {
                this.remoteOpsSubscription.unsubscribe();
                this.remoteOpsSubscription = null;
              }
              break;

            case 'changed':
              this.queue
                .push(() => this.integrateRemoteChanges(remoteOp.changes!))
                .catch((err) => {
                  console.error(err);
                });
          }
        }
      );
    });
  }

  private async unsubscribe() {
    if (!this.subscribed) {
      return;
    }
    this.sync.unsubscribe(this.topic, this.localChangesObservable);
    this.subscribed = false;
  }

  private fetch() {
    this.queue
      .push(() => this._fetch())
      .catch(() => {
        if (!this.stopped) {
          setTimeout(() => this.fetch(), this.randomRetryTimeout());
        }
      });
  }

  private async _fetch() {
    try {
      await this.attemptFetchFromRemote();
      await this.attemptSendChanges(); // reconcile
    } catch (err) {
      if (this.latest !== null) {
        await this.attemptSendChanges();
      }
      throw err;
    }
  }

  private sendChanges() {
    if (this.latest !== null) {
      this.queue
        .push(async () => {
          await this.attemptSendChanges();
          await this.reconcile();
        })
        .catch((err) => {
          console.error(err);
          setTimeout(() => this.sendChanges(), this.randomRetryTimeout());
        });
    }
  }

  private async reconcile() {
    do {
      await this.attemptFetchFromRemote();
      await this.attemptSendChanges();
    } while (this.lastSentChangeCount > 0);
  }

  private async attemptSendChanges() {
    if (this.stopped || this.latest === null) {
      throw new Error('nothing to send');
    }
    if (this.lastFromRemote === null) {
      await this.attemptSendEverything();
    } else {
      try {
        await this.attempSendOnlyChanges();
      } catch (err) {
        await this.attemptSendEverything();
      }
    }
  }

  private async attempSendOnlyChanges() {
    const lastRemote = this.lastFromRemote!;
    const latest = this.latest!;

    const changes = Automerge.getChanges(lastRemote, latest);

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
    this.lastFromRemote = Automerge.applyChanges(lastRemote, changes);
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
    this.lastFromRemote = latest;
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
      if (this.latest === null) {
        this.latest = remoteDoc;
      }
      this.remoteDoc.next(remoteDoc);
    }
  }

  async integrateRemoteChanges(changes: Change[]) {
    if (changes.length > 0) {
      if (this.lastFromRemote !== null) {
        this.lastFromRemote = Automerge.applyChanges(
          this.lastFromRemote,
          changes
        );
      }
      this.remoteChanges.next(changes);
    }
  }

  stop() {
    this.subscriptionCountSubscription?.unsubscribe();
    this.localChangesSubscription?.unsubscribe();
    if (this.remoteOpsSubscription !== null) {
      this.remoteOpsSubscription.unsubscribe();
    }
    this.unsubscribe();

    this.remoteChanges.complete();
    this.remoteDoc.complete();
    this.debouncedSendChanges.cancel();
    this.attemptSendChanges()
      .catch(() => {
        // ignore
      })
      .finally(() => {
        this.stopped = true;
        this.lastFromRemote = null;
      }); // One last attempt
  }

  private remoteUrl(): string {
    return this.fetchPrefix + '/api/syncdoc/' + encode(this.topic);
  }

  private randomRetryTimeout() {
    return Math.ceil(Math.random() * this.maxRetryIntervalMs);
  }
}
