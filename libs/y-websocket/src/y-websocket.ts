/* eslint-disable no-param-reassign */
import { getDefined } from '@decipad/utils';
import { Buffer } from 'buffer';
import * as bc from 'lib0/broadcastchannel';
import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import * as math from 'lib0/math';
import * as mutex from 'lib0/mutex';
import { Observable } from 'lib0/observable';
import * as time from 'lib0/time';
import { debounce } from 'lodash';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';
import { Doc as YDoc, mergeUpdates } from 'yjs';
import { messageHandlers } from './messageHandlers';
import {
  messageAwareness,
  MessageHandler,
  messageQueryAwareness,
  messageSync,
  MessageType,
  TWebSocketProvider,
} from './types';

export type { TWebSocketProvider };

export interface WSStatus {
  status: 'disconnected' | 'connected' | 'connecting';
}

export interface Options {
  readOnly?: boolean;
  connect?: boolean;
  connectBc?: boolean;
  awareness?: awarenessProtocol.Awareness;
  params?: Record<string, string>;
  WebSocketPolyfill?: typeof WebSocket;
  resyncInterval?: number;
  protocol?: string;
  beforeConnect?: (provider: TWebSocketProvider) => Promise<void> | void;
  onError?: (err: Error | Event) => void;
}

type ClientId = number;

interface AwarenessUpdate {
  added: ClientId[];
  updated: ClientId[];
  removed: ClientId[];
}

const reconnectTimeoutBase = 1200;
const maxReconnectTimeout = 2500;
// @todo - this should depend on awareness.outdatedTime
const messageReconnectTimeout = 30000;
const debounceBroadcast = 1000;

const encodeMessage = (message: Uint8Array): string => {
  // we have to do this awful encoding because <backendReasons />...
  return Buffer.from(message).toString('base64');
};

const isAcceptableMessage = (buf: string | Buffer | Uint8Array): boolean => {
  return (
    typeof buf === 'string' || Buffer.isBuffer(buf) || buf instanceof Uint8Array
  );
};

export const readMessage = (
  provider: TWebSocketProvider,
  buf: string | Uint8Array,
  emitSynced: boolean,
  isBase64Encoded = false
): undefined | encoding.Encoder => {
  if (!isAcceptableMessage(buf)) {
    return;
  }
  if (isBase64Encoded && typeof buf !== 'string') {
    // be extremely defensive about the encoding in these messages
    try {
      return readMessage(
        provider,
        Buffer.from(buf).toString('utf-8'),
        emitSynced,
        isBase64Encoded
      );
    } catch (err) {
      return readMessage(
        provider,
        Buffer.from(buf).toString('base64'),
        emitSynced,
        isBase64Encoded
      );
    }
  }
  if (typeof buf === 'string') {
    try {
      buf = JSON.parse(buf);
    } catch (err) {
      // do nothing
    }
  }
  try {
    const message = Buffer.from(buf as string, 'base64');
    const decoder = decoding.createDecoder(message);
    const encoder = encoding.createEncoder();
    const messageType = decoding.readVarUint(decoder);
    const messageHandler = provider.messageHandlers[messageType];
    if (messageHandler) {
      messageHandler(
        encoder,
        decoder,
        provider,
        emitSynced,
        messageType as MessageType
      );
    } else {
      // eslint-disable-next-line no-console
      console.error(
        `Could not find handler for message of type ${messageType}`
      );
    }
    return encoder;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error trying to decode message', err);
  }
  return undefined;
};

const setupWS = async (provider: TWebSocketProvider) => {
  const scheduleReconnect = () => {
    // Start with no reconnect timeout and increase timeout by
    // log10(wsUnsuccessfulReconnects).
    // The idea is to increase reconnect timeout slowly and have no reconnect
    // timeout at the beginning (log(1) = 0)
    if (provider.shouldConnect) {
      setTimeout(
        setupWS,
        math.min(
          math.log10(provider.wsUnsuccessfulReconnects + 1) *
            reconnectTimeoutBase,
          maxReconnectTimeout
        ),
        provider
      );
    }
  };

  try {
    if (provider.shouldConnect && !provider.ws && !provider.wsconnecting) {
      if (provider.beforeConnect) {
        await provider.beforeConnect(provider);
      }

      provider.emit('status', [
        {
          status: 'connecting',
        },
      ]);

      const websocket = new provider._WS(
        getDefined(provider.url),
        provider.protocol
      );
      websocket.binaryType = 'arraybuffer';
      provider.ws = websocket;
      provider.wsconnecting = true;
      provider.wsconnected = false;
      provider.synced = false;

      websocket.onerror = () => {
        // do nothing
      };

      websocket.onmessage = (event) => {
        if (provider.destroyed || !event.data) {
          return;
        }
        provider.wsLastMessageReceived = time.getUnixTime();
        try {
          const encoder = readMessage(provider, event.data, true, true);
          if (encoder && encoding.length(encoder) > 1) {
            const message = encoding.toUint8Array(encoder);
            provider.send(message);
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(
            'An error was detected while reading a message from a websocket'
          );
          // eslint-disable-next-line no-console
          console.error(err);
          provider.onError?.(err as Error);
        }
      };

      websocket.onclose = () => {
        provider.ws = undefined;
        provider.wsconnecting = false;
        if (!provider.destroyed && provider.wsconnected) {
          provider.wsconnected = false;
          provider.synced = false;
          // update awareness (all users except local left)
          awarenessProtocol.removeAwarenessStates(
            provider.awareness,
            Array.from(provider.awareness.getStates().keys()).filter(
              (client) => client !== provider.doc.clientID
            ),
            provider
          );
          provider.emit('status', [
            {
              status: 'disconnected',
            },
          ]);
        } else {
          provider.wsUnsuccessfulReconnects += 1;
        }

        if (provider.shouldConnect) {
          scheduleReconnect();
        }
      };

      websocket.onopen = () => {
        provider.wsLastMessageReceived = time.getUnixTime();
        provider.wsconnecting = false;
        provider.wsconnected = true;
        provider.wsUnsuccessfulReconnects = 0;
        provider.emit('status', [
          {
            status: 'connected',
          },
        ]);
        // always send sync step 1 when connected
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeSyncStep1(encoder, provider.doc);
        provider.send(encoding.toUint8Array(encoder));
        // broadcast local awareness state
        if (provider.awareness.getLocalState() != null) {
          const encoderAwarenessState = encoding.createEncoder();
          encoding.writeVarUint(encoderAwarenessState, messageAwareness);
          encoding.writeVarUint8Array(
            encoderAwarenessState,
            awarenessProtocol.encodeAwarenessUpdate(provider.awareness, [
              provider.doc.clientID,
            ])
          );
          provider.send(encoding.toUint8Array(encoderAwarenessState));
        }
      };
    }
  } catch (err) {
    if (provider.ws && provider.ws.readyState === provider.ws.OPEN) {
      provider.ws.close();
    }
    provider.ws = undefined;
    provider.wsconnecting = false;
    scheduleReconnect();
  }
};

const broadcastMessage = (provider: WebsocketProvider, buf: Uint8Array) => {
  if (provider.destroyed) {
    return;
  }
  if (provider.wsconnected) {
    try {
      provider.send(buf);
    } catch (err) {
      if (
        (err as Error).message !==
        'WebSocket is already in CLOSING or CLOSED state'
      ) {
        throw err;
      }
    }
  }
  if (provider.bcconnected) {
    provider.mux(() => {
      bc.publish(getDefined(provider.bcChannel), buf);
    });
  }
};

class WebsocketProvider
  extends Observable<string>
  implements TWebSocketProvider
{
  doc: YDoc;
  protocol: string | undefined;
  beforeConnect: Options['beforeConnect'];
  _WS: typeof WebSocket;
  awareness: awarenessProtocol.Awareness;
  willConnectBc: boolean;
  bcChannel?: string;
  url?: string;
  readOnly: boolean;
  shouldConnect: boolean;
  onError?: Options['onError'];
  ws: WebSocket | undefined;
  wsconnected = false;
  wsconnecting = false;
  bcconnected = false;
  wsLastMessageReceived = 0;
  wsUnsuccessfulReconnects = 0;
  messageHandlers: MessageHandler[];
  mux: mutex.mutex;
  destroyed = false;
  outUpdates: Uint8Array[] = [];
  debouncedBroadcastUpdateMessage: () => void = debounce(
    this.broadcastPendingUpdateMessages.bind(this),
    debounceBroadcast
  );
  outAwarenessUpdates: number[] = [];
  debouncedBroadcastAwarenessUpdateMessage: () => void = debounce(
    this.broadcastPendingAwarenessUpdateMessages.bind(this),
    debounceBroadcast
  );

  private _selfAwareness = false;
  private _synced = false;
  private _resyncInterval: 0 | ReturnType<typeof setInterval> = 0;
  private _checkInterval: ReturnType<typeof setInterval> | undefined;

  constructor(doc: YDoc, options: Options = {}) {
    super();
    const {
      readOnly = false,
      connect = true,
      connectBc = true,
      awareness,
      WebSocketPolyfill = WebSocket,
      resyncInterval = -1,
      protocol,
      beforeConnect,
      onError,
    } = options;

    // ensure that url is always ends with /
    this.readOnly = readOnly;
    this.doc = doc;
    this.protocol = protocol;
    this.beforeConnect = beforeConnect;
    this._WS = WebSocketPolyfill;
    this.onError = onError;

    if (!awareness) {
      this.awareness = new awarenessProtocol.Awareness(doc);
      this._selfAwareness = true;
    } else {
      this.awareness = awareness;
    }

    this.messageHandlers = messageHandlers.slice();
    this.mux = mutex.createMutex();
    this.shouldConnect = connect;
    this.willConnectBc = connectBc;

    if (resyncInterval > 0) {
      this._resyncInterval = setInterval(() => {
        if (this.ws && this.wsconnected && !this.readOnly) {
          // resend sync step 1
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messageSync);
          syncProtocol.writeSyncStep1(encoder, doc);
          try {
            this.send(encoding.toUint8Array(encoder));
          } catch (err) {
            if (
              (err as Error).message !==
              'WebSocket is already in CLOSING or CLOSED state'
            ) {
              throw err;
            }
          }
        }
      }, resyncInterval);
    }

    this._updateHandler = this._updateHandler.bind(this);
    this._beforeUnloadHandler = this._beforeUnloadHandler.bind(this);
    this._bcSubscriber = this._bcSubscriber.bind(this);
    this._awarenessUpdateHandler = this._awarenessUpdateHandler.bind(this);

    if (!this.readOnly) {
      this.doc.on('update', this._updateHandler);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this._beforeUnloadHandler);
    } else if (typeof process !== 'undefined') {
      process.on('exit', () => this._beforeUnloadHandler);
    }
    if (!readOnly) {
      this.awareness.on('update', this._awarenessUpdateHandler);
    }
    this._checkInterval = setInterval(() => {
      if (
        this.wsconnected &&
        messageReconnectTimeout <
          time.getUnixTime() - this.wsLastMessageReceived
      ) {
        // no message received in a long time - not even your own awareness
        // updates (which are updated every 15 seconds)
        this.shouldConnect = true;
        this.ws?.close();
      }
    }, messageReconnectTimeout / 10);

    if (connect) {
      this.connect();
    }
  }

  set serverUrl(serverUrl: string | undefined) {
    if (serverUrl) {
      const url = new URL(serverUrl).href;
      this.bcChannel = url;
      this.url = url;
    }
  }

  get serverUrl(): string | undefined {
    return this.url;
  }

  send(message: Uint8Array): void {
    if (this.wsconnected && this.ws) {
      this.ws.send(encodeMessage(message));
    }
  }

  private _bcSubscriber(data: ArrayBuffer) {
    this.mux(() => {
      const encoder = readMessage(this, new Uint8Array(data), false);
      if (encoder && encoding.length(encoder) > 1) {
        bc.publish(getDefined(this.bcChannel), encoding.toUint8Array(encoder));
      }
    });
  }

  private _updateHandler(update: Uint8Array, origin: unknown) {
    if (origin !== this && !this.readOnly) {
      this.outUpdates.push(update);
      this.debouncedBroadcastUpdateMessage();
    }
  }

  private broadcastPendingUpdateMessages() {
    const toSend = Array.from(this.outUpdates);
    this.outUpdates = [];
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, mergeUpdates(toSend));
    if (encoding.length(encoder) > 1) {
      broadcastMessage(this, encoding.toUint8Array(encoder));
    }
    this.emit('saved', [this]);
  }

  private _awarenessUpdateHandler(changes: AwarenessUpdate) {
    const { added, updated, removed } = changes;
    const changedClients = added.concat(updated).concat(removed);
    this.outAwarenessUpdates.concat(changedClients);
    this.debouncedBroadcastAwarenessUpdateMessage();
  }

  private broadcastPendingAwarenessUpdateMessages() {
    const changedClients = Array.from(this.outAwarenessUpdates);
    if (changedClients.length > 0) {
      this.outAwarenessUpdates = [];
      const update = awarenessProtocol.encodeAwarenessUpdate(
        this.awareness,
        changedClients
      );
      const encoder = encoding.createEncoder();
      encoding.writeVarUint8Array(encoder, update);
      if (encoding.length(encoder) > 1) {
        broadcastMessage(this, encoding.toUint8Array(encoder));
      }
    }
  }

  private _beforeUnloadHandler() {
    awarenessProtocol.removeAwarenessStates(
      this.awareness,
      [this.doc.clientID],
      'window unload'
    );
  }

  get synced(): boolean {
    return this._synced;
  }

  set synced(state: boolean) {
    if (this._synced !== state) {
      this._synced = state;
      this.emit('synced', [state]);
      this.emit('sync', [state]);
    }
  }

  destroy(): void {
    this.destroyed = true;
    if (this._resyncInterval !== 0) {
      clearInterval(this._resyncInterval);
    }
    if (this._checkInterval) {
      clearInterval(this._checkInterval);
    }

    this.disconnect();
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this._beforeUnloadHandler);
    } else if (typeof process !== 'undefined') {
      process.off('exit', () => this._beforeUnloadHandler);
    }
    this.awareness.off('update', this._awarenessUpdateHandler);
    if (this._selfAwareness) {
      this.awareness.destroy();
    }

    this.doc.off('update', this._updateHandler);
    super.destroy();
  }

  connectBc(): void {
    if (!this.bcconnected) {
      bc.subscribe(getDefined(this.bcChannel), this._bcSubscriber);
      this.bcconnected = true;
    }
    // send sync step1 to bc
    this.mux(() => {
      // write sync step 1
      const encoderSync = encoding.createEncoder();
      encoding.writeVarUint(encoderSync, messageSync);
      syncProtocol.writeSyncStep1(encoderSync, this.doc);
      bc.publish(
        getDefined(this.bcChannel),
        encoding.toUint8Array(encoderSync)
      );
      // broadcast local state
      const encoderState = encoding.createEncoder();
      encoding.writeVarUint(encoderState, messageSync);
      syncProtocol.writeSyncStep2(encoderState, this.doc);
      bc.publish(
        getDefined(this.bcChannel),
        encoding.toUint8Array(encoderState)
      );
      // write queryAwareness
      const encoderAwarenessQuery = encoding.createEncoder();
      encoding.writeVarUint(encoderAwarenessQuery, messageQueryAwareness);
      bc.publish(
        getDefined(this.bcChannel),
        encoding.toUint8Array(encoderAwarenessQuery)
      );
      // broadcast local awareness state
      const encoderAwarenessState = encoding.createEncoder();
      encoding.writeVarUint(encoderAwarenessState, messageAwareness);
      encoding.writeVarUint8Array(
        encoderAwarenessState,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
          this.doc.clientID,
        ])
      );
      bc.publish(
        getDefined(this.bcChannel),
        encoding.toUint8Array(encoderAwarenessState)
      );
    });
  }

  disconnectBc(): void {
    // broadcast message with local awareness state set to null (indicating disconnect)
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        this.awareness,
        [this.doc.clientID],
        new Map()
      )
    );
    broadcastMessage(this, encoding.toUint8Array(encoder));
    if (this.bcconnected) {
      bc.unsubscribe(getDefined(this.bcChannel), this._bcSubscriber);
      this.bcconnected = false;
    }
  }

  disconnect(): void {
    this.shouldConnect = false;
    this.disconnectBc();
    if (this.ws != null) {
      try {
        this.ws.close();
      } catch (err) {
        // do nothing
      }
      this.emit('status', [
        {
          status: 'disconnected',
        },
      ]);
    }
  }

  async connect(): Promise<void> {
    this.shouldConnect = true;
    if (!this.wsconnected && !this.ws) {
      await setupWS(this);
      if (this.willConnectBc) {
        this.connectBc();
      }
    }
  }
}

export const createWebsocketProvider = (
  doc: YDoc,
  options: Options = {}
): TWebSocketProvider => {
  return new WebsocketProvider(doc, options);
};
