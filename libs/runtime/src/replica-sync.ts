import { Observable, Subscription, Subject } from 'rxjs';
import Automerge, { Change, Doc } from 'automerge';
import debounce from 'lodash.debounce';
import { Runtime } from './runtime';
import { fnQueue } from './utils/fn-queue';
import { encode } from './utils/resource';

const MAX_RETRY_INTERVAL_MS =
  Number(process.env.DECI_MAX_RETRY_INTERVAL_MS) || 10000;
const SEND_CHANGES_DEBOUNCE_MS =
  Number(process.env.DECI_SEND_CHANGES_DEBOUNCE_MS) || 3000;

const fetchPrefix = process.env.DECI_API_URL || '';

export class ReplicaSync<T> {
  private topic: string;
  private runtime: Runtime;
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
    topic,
    runtime,
    localChangesObservable,
    subscriptionCountObservable,
    start = true,
  }: {
    topic: string;
    runtime: Runtime;
    localChangesObservable: Observable<Mutation<Doc<{ value: T }>>>;
    subscriptionCountObservable: Observable<number>;
    start: boolean;
  }) {
    this.topic = topic;
    this.runtime = runtime;
    this.localChangesObservable = localChangesObservable;
    this.subscriptionCountObservable = subscriptionCountObservable;

    this.sendChanges = this.sendChanges.bind(this);
    this.debouncedSendChanges = debounce(
      this.sendChanges,
      SEND_CHANGES_DEBOUNCE_MS
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

      const remoteOpsObservable = this.runtime.sync.subscribe(
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
    this.runtime.sync.unsubscribe(this.topic, this.localChangesObservable);
    this.subscribed = false;
  }

  private fetch() {
    this.queue
      .push(() => this._fetch())
      .catch(() => {
        setTimeout(() => this.fetch(), randomRetryTimeout());
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
        .catch(() => {
          setTimeout(() => this.sendChanges(), randomRetryTimeout());
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

  remoteUrl(): string {
    return fetchPrefix + '/api/syncdoc/' + encode(this.topic);
  }
}

function randomRetryTimeout() {
  return Math.ceil(Math.random() * MAX_RETRY_INTERVAL_MS);
}
