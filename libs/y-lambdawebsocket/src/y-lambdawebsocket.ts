/* eslint-disable no-param-reassign */
import { Buffer } from 'buffer';
import { Doc as YDoc } from 'yjs';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync';
import * as authProtocol from 'y-protocols/auth';
import * as awarenessProtocol from 'y-protocols/awareness';
import { Observable } from 'lib0/observable';
import arc from '@architect/functions';
import tables from '@decipad/tables';
import { fnQueue } from '@decipad/fnqueue';
import { noop } from '@decipad/utils';

interface Options {
  awareness?: awarenessProtocol.Awareness;
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

const broadcastMessage = async (
  provider: LambdaWebsocketProvider,
  message: Uint8Array
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

const send = async (connId: string, message: Uint8Array): Promise<void> => {
  const payload = Buffer.from(message).toString('base64');
  await arc.ws.send({ id: connId, payload });
};

const trySend = async (connId: string, payload: Uint8Array): Promise<void> => {
  try {
    await send(connId, payload);
  } catch (err) {
    if (!(err as ErrorWithCode)?.code?.match('Gone')) {
      throw err;
    }
  }
};

export class LambdaWebsocketProvider extends Observable<string> {
  name: string;
  connId: string;
  doc: YDoc;
  awareness: awarenessProtocol.Awareness;
  wsconnected = false;
  wsconnecting = false;
  bcconnected = false;
  wsLastMessageReceived = 0;
  wsUnsuccessfulReconnects = 0;
  messageHandlers: MessageHandler[];
  mux = fnQueue();
  public destroyed = false;

  private _selfAwareness = false;
  private _synced = false;

  constructor(name: string, connId: string, doc: YDoc, options: Options = {}) {
    super();
    this.name = name;
    this.connId = connId;
    const { awareness } = options;

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
  }

  private async send(message: Uint8Array): Promise<void> {
    if (this.destroyed) {
      return;
    }
    await trySend(this.connId, message);
  }

  private async _updateHandler(update: Uint8Array, origin: unknown) {
    if (origin !== this) {
      this.mux.push(async () => {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeUpdate(encoder, update);
        if (encoding.length(encoder) > 1) {
          await broadcastMessage(this, encoding.toUint8Array(encoder));
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
      await broadcastMessage(this, encoding.toUint8Array(encoder));
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
        await this.send(encoding.toUint8Array(encoder));
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
      this.send(encoding.toUint8Array(encoder));
      // broadcast local awareness state
      if (this.awareness.getLocalState() !== null) {
        const encoderAwarenessState = encoding.createEncoder();
        encoding.writeVarUint(encoderAwarenessState, messageAwareness);
        encoding.writeVarUint8Array(
          encoderAwarenessState,
          awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
            this.doc.clientID,
          ])
        );
        await this.send(encoding.toUint8Array(encoderAwarenessState));
      }
    });
  }

  onClose(): void {
    awarenessProtocol.removeAwarenessStates(
      this.awareness,
      Array.from(this.awareness.getStates().keys()).filter(
        (client) => client !== this.doc.clientID
      ),
      this
    );
    this.emit('status', [
      {
        status: 'disconnected',
      },
    ]);
  }

  flush(): Promise<void> {
    return this.mux.flush().then(noop);
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
