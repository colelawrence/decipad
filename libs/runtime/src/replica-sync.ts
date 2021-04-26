import { Observable, Subscription, Subject } from 'rxjs';
import Automerge, { Change, Doc } from 'automerge';
import debounce from 'lodash.debounce';
import { Runtime } from './runtime';
import { fnQueue } from './utils/fn-queue';

const AVERAGE_RESEND_TRY_INTERVAL_MS = 10000;
const AVERAGE_FETCH_TRY_INTERVAL_MS = 10000;

export class ReplicaSync<T> {
  private subscriptionCountSubscription: Subscription;
  private localChangesSubscription: Subscription;
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

  constructor(
    private topic: string,
    private runtime: Runtime,
    private localChangesObservable: Observable<Mutation<Doc<{ value: T }>>>,
    private subscriptionCountObservable: Observable<number>
  ) {
    this.sendChanges = this.sendChanges.bind(this);
    this.debouncedSendChanges = debounce(this.sendChanges, 3000);

    this.subscriptionCountSubscription = this.subscriptionCountObservable.subscribe(
      (observerCount) => {
        if (observerCount === 0) {
          this.queue.push(() => this.unsubscribe());
        } else if (observerCount > 0) {
          this.queue.push(() => this.subscribe());
        }
      }
    );

    this.localChangesSubscription = localChangesObservable.subscribe(
      ({ after }) => {
        this.latest = after;
        this.debouncedSendChanges();
      }
    );

    this.fetchFromRemote(1)
      .catch(() => this.sendChanges(1))
      .catch(() => this.fetchFromRemote())
      .then(() => this.sendChanges());
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
              resolve();
              break;

            case 'unsubscribed':
              if (this.remoteOpsSubscription !== null) {
                this.remoteOpsSubscription.unsubscribe();
                this.remoteOpsSubscription = null;
              }
              break;

            case 'changed':
              if (remoteOp.changes === null) {
                this.queue.push(() => this.fetchFromRemote());
              } else if (remoteOp.changes.length > 0) {
                this.queue.push(() =>
                  this.integrateRemoteChanges(remoteOp.changes!)
                );
              }
              break;
          }
        }
      );
      this.subscribed = true;
    });
  }

  private async unsubscribe() {
    if (!this.subscribed) {
      return;
    }
    this.runtime.sync.unsubscribe(this.topic, this.localChangesObservable);
    this.subscribed = false;
  }

  private sendChanges(maxAttempts = Infinity) {
    let attemptsLeft = maxAttempts;
    let lastError: Error | null = null;

    const attempt = (
      resolve: (value: unknown) => void,
      reject: (err: Error) => void
    ) => {
      attemptsLeft--;
      if (attemptsLeft < 0) {
        return reject(lastError || new Error('max attemps exceeded'));
      }

      this.attemptSendChanges()
        .then(resolve)
        .catch((err) => {
          console.error(err);
          lastError = err;
          if (attemptsLeft === 0) {
            reject(err);
          } else {
            console.log('GOING TO ATTEMPT FETCHING AS A FALLBACK');
            this.attemptFetchFromRemote()
              .then(() => attempt(resolve, reject))
              .catch((err) => {
                console.error(err);
                setTimeout(
                  () => attempt(resolve, reject),
                  randomSendChangesTimeout()
                );
              });
          }
        });
    };
    return this.queue.push(() => new Promise(attempt));
  }

  private async attemptSendChanges() {
    if (this.stopped || this.latest === null) {
      return;
    }
    if (this.lastFromRemote === null) {
      return await this.attemptSendEverything();
    } else {
      try {
        return await this.attempSendOnlyChanges();
      } catch (err) {
        if (err instanceof RangeError) {
          return await this.attemptSendEverything();
        }
        throw err;
      }
    }
  }

  private async attempSendOnlyChanges() {
    const lastRemote = this.lastFromRemote!;
    const latest = this.latest!;

    const changes = Automerge.getChanges(lastRemote, latest);

    if (changes.length > 0) {
      const response = await fetch('/api' + this.topic + '/changes', {
        method: 'PUT',
        body: JSON.stringify(changes),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });

      if (!response.ok) {
        const message = `Failed to send data to remote: ${await response.text()}`;
        console.error(message);
        throw new Error(message);
      }
    }

    this.lastFromRemote = Automerge.applyChanges(lastRemote, changes);
  }

  private async attemptSendEverything() {
    const latest = this.latest!;
    this.latest = null;
    const response = await fetch('/api' + this.topic, {
      method: 'PUT',
      body: Automerge.save(latest),
      headers: {
        'Content-Type': 'text/text',
      },
    });

    if (!response.ok) {
      const message = `Failed to send data to remote: ${await response.text()}`;
      console.error(message);
      throw new Error(message);
    }
    this.lastFromRemote = latest;
  }

  async fetchFromRemote(maxAttempts = Infinity) {
    let attemptsLeft = maxAttempts;
    let lastError: Error | null = null;
    const attempt = (
      resolve: (value: unknown) => void,
      reject: (err: Error) => void
    ) => {
      attemptsLeft--;
      if (attemptsLeft < 0) {
        return reject(lastError || new Error('max attemps exceeded'));
      }
      this.attemptFetchFromRemote()
        .then(resolve)
        .catch((err) => {
          console.error(err);
          lastError = err;
          if (attemptsLeft === 0) {
            reject(err);
          } else {
            setTimeout(
              () => attempt(resolve, reject),
              randomFetchChangesTimeout()
            );
          }
        });
    };
    return this.queue.push(() => new Promise(attempt));
  }

  async attemptFetchFromRemote() {
    if (this.stopped) {
      return;
    }
    const resp = await fetch('/api' + this.topic);
    if (resp.status === 404 && this.latest !== null) {
      this.sendChanges();
      return;
    }
    if (!resp.ok) {
      throw new Error(
        'response was not ok: ' + resp.status + ': ' + (await resp.text())
      );
    }
    const doc = await resp.text();
    if (doc.length > 0) {
      const remoteDoc = Automerge.load(doc) as Doc<{ value: T }>;
      if (this.lastFromRemote !== null) {
        this.lastFromRemote = Automerge.merge(this.lastFromRemote, remoteDoc);
      } else {
        this.lastFromRemote = remoteDoc;
      }

      this.remoteDoc.next(remoteDoc);
    }
  }

  async integrateRemoteChanges(changes: Change[]) {
    if (this.lastFromRemote !== null) {
      this.lastFromRemote = Automerge.applyChanges(
        this.lastFromRemote,
        changes
      );
    }
    this.remoteChanges.next(changes);
  }

  stop() {
    this.stopped = true;
    this.subscriptionCountSubscription.unsubscribe();
    this.localChangesSubscription.unsubscribe();
    if (this.remoteOpsSubscription !== null) {
      this.remoteOpsSubscription.unsubscribe();
    }
    if (this.subscribed) {
      this.unsubscribe();
    }

    this.remoteChanges.complete();
    this.remoteDoc.complete();
    this.debouncedSendChanges.cancel();
    this.sendChanges(1); // One last attempt
    this.lastFromRemote = null;
  }
}

function randomSendChangesTimeout() {
  return Math.ceil(Math.random() * AVERAGE_RESEND_TRY_INTERVAL_MS);
}

function randomFetchChangesTimeout() {
  return Math.ceil(Math.random() * AVERAGE_FETCH_TRY_INTERVAL_MS);
}
