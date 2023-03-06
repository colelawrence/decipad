/* eslint-disable no-param-reassign */
import { Doc as YDoc } from 'yjs';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync';
import * as authProtocol from 'y-protocols/auth';
import * as awarenessProtocol from 'y-protocols/awareness';
import { ws } from '@architect/functions';
import { Observable } from 'lib0/observable';
import tables from '@decipad/tables';
import { fnQueue } from '@decipad/fnqueue';
import { noop } from '@decipad/utils';
import { Subscription } from 'rxjs';
import { awsRetry, retry } from '@decipad/retry';
import { MessageSender, sender } from './send';

interface Options {
  awareness?: awarenessProtocol.Awareness;
  protocolVersion?: number;
}

type ErrorWithCode = Error & {
  code: string;
};

export type MessageType = 0 | 1 | 2 | 3;
export const messageSync = 0;
export const messageQueryAwareness = 3;
export const messageAwareness = 1;
export const messageAuth = 2;

type ClientId = number;

interface AwarenessUpdate {
  added: ClientId[];
  updated: ClientId[];
  removed: ClientId[];
}

type MessageHandler = (
  encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  provider: LambdaWebsocketProvider,
  emitSynced: boolean,
  messageType: MessageType
) => void;

const messageHandlers: MessageHandler[] = [];

messageHandlers[messageSync] = (
  encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  provider: LambdaWebsocketProvider,
  emitSynced: boolean
) => {
  encoding.writeVarUint(encoder, messageSync);
  const syncMessageType = syncProtocol.readSyncMessage(
    decoder,
    encoder,
    provider.doc,
    provider
  );
  if (
    emitSynced &&
    syncMessageType === syncProtocol.messageYjsSyncStep2 &&
    !provider.synced
  ) {
    provider.synced = true;
  }
};

messageHandlers[messageQueryAwareness] = (
  encoder: encoding.Encoder,
  _decoder: decoding.Decoder,
  provider: LambdaWebsocketProvider
) => {
  encoding.writeVarUint(encoder, messageAwareness);
  encoding.writeVarUint8Array(
    encoder,
    awarenessProtocol.encodeAwarenessUpdate(
      provider.awareness,
      Array.from(provider.awareness.getStates().keys())
    )
  );
};

messageHandlers[messageAwareness] = (
  _encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  provider: LambdaWebsocketProvider
) => {
  awarenessProtocol.applyAwarenessUpdate(
    provider.awareness,
    decoding.readVarUint8Array(decoder),
    provider
  );
};

messageHandlers[messageAuth] = (
  _encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  provider: LambdaWebsocketProvider
) => {
  authProtocol.readAuthMessage(decoder, provider.doc, permissionDeniedHandler);
};

const permissionDeniedHandler = (
  _provider: LambdaWebsocketProvider,
  reason: string
) =>
  // eslint-disable-next-line no-console
  console.warn(`Permission denied to access.\n${reason}`);

const readMessage = (
  provider: LambdaWebsocketProvider,
  message: Uint8Array,
  emitSynced: boolean
): encoding.Encoder => {
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
    console.error('Unable to compute message');
  }
  return encoder;
};

export const MAX_MESSAGE_BYTES = 80_000;

const broadcastMessage = async (
  provider: LambdaWebsocketProvider,
  message: string
) => {
  if (provider.destroyed) {
    return;
  }
  const from = provider.connId;
  const data = await tables();
  // are we still alive?
  const me = await data.connections.get({ id: from });
  if (!me) {
    return;
  }

  const conns = (
    await data.connections.query({
      IndexName: 'byRoom',
      KeyConditionExpression: 'room = :room',
      ExpressionAttributeValues: {
        ':room': provider.name,
      },
    })
  ).Items;

  await Promise.all(
    conns
      .filter((conn) => conn.id !== from)
      .map((conn) => {
        return trySend(conn.id, message);
      })
  );
};

const isSeriousError = (err: Error) => {
  const isGone =
    (err as ErrorWithCode)?.code?.match('Gone') ||
    (err as Error).message.includes('Gone');
  return !isGone;
};

export const trySend = async (
  connId: string,
  payload: string
): Promise<void> => {
  try {
    await retry(() => ws.send({ id: connId, payload }), awsRetry);
  } catch (err) {
    if (err instanceof Error && isSeriousError(err)) {
      throw err;
    }
  }
};

export class LambdaWebsocketProvider extends Observable<string> {
  name: string;
  connId: string;
  protocolVersion: number;
  doc: YDoc;
  awareness: awarenessProtocol.Awareness;
  wsconnected = false;
  wsconnecting = false;
  bcconnected = false;
  wsLastMessageReceived = 0;
  wsUnsuccessfulReconnects = 0;
  messageHandlers: MessageHandler[];
  mux = fnQueue();
  sendQueue = fnQueue();

  senderSubscription: Subscription;
  sender: MessageSender;

  public destroyed = false;

  private _selfAwareness = false;
  private _synced = false;

  constructor(name: string, connId: string, doc: YDoc, options: Options = {}) {
    super();
    this.name = name;
    this.connId = connId;
    const { awareness, protocolVersion } = options;
    this.protocolVersion = protocolVersion ?? 1;

    this.doc = doc;

    if (!awareness) {
      this.awareness = new awarenessProtocol.Awareness(doc);
      this._selfAwareness = true;
    } else {
      this.awareness = awareness;
    }

    this.messageHandlers = messageHandlers.slice();

    this._updateHandler = this._updateHandler.bind(this);
    this._beforeUnloadHandler = this._beforeUnloadHandler.bind(this);
    this._awarenessUpdateHandler = this._awarenessUpdateHandler.bind(this);

    this.doc.on('update', this._updateHandler);

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this._beforeUnloadHandler);
    } else if (typeof process !== 'undefined') {
      process.on('exit', () => this._beforeUnloadHandler);
    }
    this.awareness.on('update', this._awarenessUpdateHandler);

    this.sender = sender(this.protocolVersion);
    this.senderSubscription = this.sender.message.subscribe(
      this.lowLevelSend.bind(this)
    );
  }

  private async lowLevelSend(message: string, to = this.connId): Promise<void> {
    if (this.destroyed) {
      return;
    }
    this.sendQueue.push(() => trySend(to, message));
  }

  private send(message: Buffer) {
    this.sender.send(message);
  }

  private broadcast(message: Buffer) {
    const s = sender(this.protocolVersion);
    const sub = s.message.subscribe((m) => {
      broadcastMessage(this, m);
    });
    s.send(message);
    sub.unsubscribe();
  }

  private async _updateHandler(update: Uint8Array, origin: unknown) {
    if (origin !== this) {
      this.mux.push(async () => {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeUpdate(encoder, update);
        if (encoding.length(encoder) > 1) {
          await this.broadcast(Buffer.from(encoding.toUint8Array(encoder)));
        }
        this.emit('saved', [this]);
      });
    }
  }

  private _awarenessUpdateHandler(changes: AwarenessUpdate) {
    this.mux.push(async () => {
      const { added, updated, removed } = changes;
      const changedClients = added.concat(updated).concat(removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
      );
      await this.broadcast(Buffer.from(encoding.toUint8Array(encoder)));
    });
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

  async receive(message: Uint8Array): Promise<void> {
    this.mux.push(async () => {
      this.wsLastMessageReceived = Date.now();
      const encoder = readMessage(this, message, true);
      if (encoding.length(encoder) > 1) {
        await this.send(Buffer.from(encoding.toUint8Array(encoder)));
      }
    });
  }

  onOpen(): void {
    this.mux.push(async () => {
      this.emit('status', [
        {
          status: 'connected',
        },
      ]);
      // always send sync step 1 when connected
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeSyncStep1(encoder, this.doc);
      this.send(Buffer.from(encoding.toUint8Array(encoder)));
    });
  }

  onClose(): void {
    this.awareness.setLocalState(null);
    this.emit('status', [
      {
        status: 'disconnected',
      },
    ]);
  }

  flush(): Promise<void> {
    return this.mux
      .flush()
      .then(() => this.sendQueue.flush())
      .then(noop);
  }

  destroy(): void {
    this.destroyed = true;
    if (typeof process !== 'undefined') {
      process.off('exit', () => this._beforeUnloadHandler);
    }
    this.awareness.off('update', this._awarenessUpdateHandler);
    if (this._selfAwareness) {
      this.awareness.destroy();
    }

    this.doc.off('update', this._updateHandler);
    super.destroy();
  }
}
