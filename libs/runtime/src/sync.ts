import { Doc } from 'automerge';
import EventEmitter from 'events';
import { Observable, Subscription } from 'rxjs';
import { SyncSubscriptionManager } from './sync-subscription-manager';

const MAX_RECONNECT_MS = Number(process.env.DECI_MAX_RECONNECT_MS) || 10000;
const fetchPrefix = process.env.DECI_API_URL || '';

export class Sync<T> extends EventEmitter {
  private subscriptionManager = new SyncSubscriptionManager<T>();
  private subscriptionManagerTopicSubscription: Subscription;
  private topics = new Set<string>();
  private connecting = false;
  private stopped = false;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  connection: WebSocket | null = null;

  constructor() {
    super();
    this.onWebsocketClose = this.onWebsocketClose.bind(this);
    this.onWebsocketOpen = this.onWebsocketOpen.bind(this);
    this.onWebsocketMessage = this.onWebsocketMessage.bind(this);
    this.onWebsocketError = this.onWebsocketError.bind(this);

    this.subscriptionManagerTopicSubscription =
      this.subscriptionManager.topicObservable.subscribe(({ op, topic }) => {
        switch (op) {
          case 'add':
            if (!this.topics.has(topic)) {
              // TODO: get
              this.topics.add(topic);
              this.subscribeRemote(topic);
            }
            break;
          case 'remove':
            if (this.topics.has(topic)) {
              // TODO: cancel
              this.topics.delete(topic);
              this.unsubscribeRemote(topic);
              if (this.topics.size === 0) {
                this.disconnect();
              }
            }
            break;
        }
      });
  }

  subscribe(
    topic: string,
    localChangesObservable: Observable<Mutation<Doc<{ value: T }>>>
  ): Observable<RemoteOp> {
    return this.subscriptionManager.subscribe(topic, localChangesObservable);
  }

  unsubscribe(
    topic: string,
    localChangesObservable: Observable<Mutation<Doc<{ value: T }>>>
  ) {
    this.subscriptionManager.unsubscribe(topic, localChangesObservable);
  }

  stop() {
    this.stopped = true;
    this.subscriptionManagerTopicSubscription.unsubscribe();
    this.subscriptionManager.stop();
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.disconnect();
  }

  private disconnect() {
    if (
      this.connection !== null &&
      this.connection.readyState !== WebSocket.CLOSED &&
      this.connection.readyState !== WebSocket.CLOSING
    ) {
      this.connection.close();
      this.connection = null;
    }
  }

  private subscribeRemote(topic: string) {
    const conn = this.connection;
    if (conn !== null && conn.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify(['subscribe', topic]));
    } else {
      this.connect();
    }
  }

  private unsubscribeRemote(topic: string) {
    const conn = this.connection;
    if (conn !== null && conn.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify(['unsubscribe', topic]));
      if (this.topics.size === 0) {
        conn.close();
      }
    }
  }

  private async connect() {
    if (this.stopped || this.connecting) {
      return;
    }
    if (this.topics.size === 0) {
      return;
    }
    if (
      this.connection !== null &&
      this.connection.readyState === WebSocket.CONNECTING
    ) {
      return;
    }
    this.connecting = true;
    let token;
    try {
      token = await getAuthToken();
    } catch (err) {
      if (err.code !== 'ECONNREFUSED') {
        console.error(err);
      }
      // do nothing
    } finally {
      this.connecting = false;
    }
    if (!token) {
      this.timeout = setTimeout(() => this.connect(), randomReconnectTimeout());
      return;
    }

    this.connection = new WebSocket(
      process.env.NEXT_PUBLIC_DECI_WS_URL || 'ws://localhost:3333/ws',
      token
    );
    this.connection.onerror = this.onWebsocketError;
    this.connection.onopen = this.onWebsocketOpen;
    this.connection.onmessage = this.onWebsocketMessage;
    this.connection.onclose = this.onWebsocketClose;
    this.emit('websocket', this.connection);
  }

  private onWebsocketOpen(event: Event) {
    this.emit('websocket open', event);
    if (this.topics.size === 0 && this.connection !== null) {
      this.connection.close();
    } else {
      for (const topic of this.topics) {
        this.subscribeRemote(topic);
      }
    }
  }

  private onWebsocketMessage(event: MessageEvent) {
    const m = JSON.parse(event.data) as RemoteWebSocketOp;
    const { o: op, t: topic, c: changes = null, type = null } = m;

    if (type !== null) {
      // external message
      this.emit('websocket message', event);
    }

    let opString: RemoteOp['op'];
    switch (op) {
      case 's':
        opString = 'subscribed';
        break;

      case 'u':
        opString = 'unsubscribed';
        break;

      case 'c':
        opString = 'changed';
        break;

      default:
        throw new Error('Unsupported operation:' + op);
    }
    // TODO: extract changes from message (once they come)
    this.subscriptionManager.notifyRemoteOp({ op: opString, topic, changes });
  }

  private onWebsocketClose(event: Event) {
    this.emit('websocket close', event);
    this.connection = null;
    this.timeout = setTimeout(() => this.connect(), randomReconnectTimeout());
  }

  private onWebsocketError(event: Event) {
    this.emit('websocket error', event);
  }
}

function randomReconnectTimeout() {
  return Math.ceil(Math.random() * MAX_RECONNECT_MS);
}

async function getAuthToken(): Promise<string> {
  const resp = await fetch(fetchPrefix + '/api/auth/token?for=pubsub');
  if (!resp.ok) {
    const message = `Failed fetching token from remote: ${await resp.text()}`;
    throw new Error(message);
  }
  return await resp.text();
}
