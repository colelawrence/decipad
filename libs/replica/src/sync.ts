import { Doc } from 'automerge';
import EventEmitter from 'events';
import { Observable, Subscription } from 'rxjs';
import { SyncSubscriptionManager } from './sync-subscription-manager';
import createExternalWebsocketImpl from './external-websocket';
import { RemoteOp, Mutation, RemoteWebSocketOp } from './types';

interface SyncConstructorOptions {
  start: boolean;
  maxReconnectMs: number;
  fetchPrefix: string;
}

export class Sync<T> extends EventEmitter {
  private options: SyncConstructorOptions;
  private subscriptionManager = new SyncSubscriptionManager<T>();
  private subscriptionManagerTopicSubscription: Subscription | null = null;
  private topics = new Set<string>();
  public connecting = false;
  private forceConnecting = false;
  private stopped = false;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  connection: WebSocket | null = null;

  constructor(options: SyncConstructorOptions) {
    super();
    this.options = options;
    this.onWebsocketClose = this.onWebsocketClose.bind(this);
    this.onWebsocketOpen = this.onWebsocketOpen.bind(this);
    this.onWebsocketMessage = this.onWebsocketMessage.bind(this);
    this.onWebsocketError = this.onWebsocketError.bind(this);

    if (options.start) {
      this.start();
    }
  }

  start() {
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
    this.subscriptionManagerTopicSubscription?.unsubscribe();
    this.subscriptionManager.stop();
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.disconnect();
  }

  websocketImpl(): typeof WebSocket {
    return createExternalWebsocketImpl(this);
  }

  private disconnect() {
    if (
      this.connection !== null &&
      this.connection.readyState !== WebSocket.CLOSED &&
      this.connection.readyState !== WebSocket.CLOSING
    ) {
      const connection = this.connection;
      this.connection = null;
      this.connecting = false;
      this.forceConnecting = false;
      connection.close();
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
    }
    this.maybeClose();
  }

  public maybeClose(): boolean {
    if (this.connection && this.topics.size === 0) {
      this.disconnect();
      return true;
    }
    return false;
  }

  public close() {
    this.maybeClose();
  }

  public async connect(force = false) {
    // if connection was opened once forcefully, we should keep that knowledge
    if (force) {
      this.forceConnecting = true;
    }

    if (this.stopped || this.connecting) {
      return;
    }
    if (!this.forceConnecting && this.topics.size === 0) {
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
      token = await this.getAuthToken();
    } catch (err) {
      if (
        err.code !== 'ECONNREFUSED' &&
        !err.message.startsWith('Failed fetching token from remote')
      ) {
        console.error(err);
      }
      // do nothing
    } finally {
      this.connecting = false;
    }
    if (!token) {
      this.timeout = setTimeout(
        () => this.connect(),
        this.randomReconnectTimeout()
      );
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
    this.connecting = false;
    if (
      !this.forceConnecting &&
      this.topics.size === 0 &&
      this.connection !== null
    ) {
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
      return;
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
    const remoteOp = { op: opString, topic, changes };
    // TODO: extract changes from message (once they come)
    this.subscriptionManager.notifyRemoteOp(remoteOp);
  }

  private onWebsocketClose(event: Event) {
    this.emit('websocket close', event);
    const connection = this.connection;
    if (connection) {
      this.connection = null;
      connection.onerror = null;
      connection.onopen = null;
      connection.onmessage = null;
      connection.onclose = null;
    }

    this.timeout = setTimeout(
      () => this.connect(),
      this.randomReconnectTimeout()
    );
  }

  private onWebsocketError(event: Event) {
    this.emit('websocket error', event);
  }

  private randomReconnectTimeout() {
    return Math.ceil(Math.random() * this.options.maxReconnectMs);
  }

  private async getAuthToken(): Promise<string> {
    const resp = await fetch(
      this.options.fetchPrefix + '/api/auth/token?for=pubsub'
    );
    if (!resp || !resp.ok) {
      const message = `Failed fetching token from remote: ${
        (await resp?.text()) || 'unknown'
      }`;
      throw new Error(message);
    }
    return await resp.text();
  }
}
