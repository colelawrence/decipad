import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as authProtocol from 'y-protocols/auth';
import {
  messageAuth,
  messageAwareness,
  MessageHandler,
  messageQueryAwareness,
  messageSync,
  TWebSocketProvider,
} from './types';

const permissionDeniedHandler = (
  provider: TWebSocketProvider,
  reason: string
) =>
  // eslint-disable-next-line no-console
  console.warn(`Permission denied to access ${provider.url}.\n${reason}`);

export const messageHandlers: MessageHandler[] = [];

messageHandlers[messageSync] = (
  encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  provider: TWebSocketProvider,
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
    // eslint-disable-next-line no-param-reassign
    provider.synced = true;
  }
};

messageHandlers[messageQueryAwareness] = (
  encoder: encoding.Encoder,
  _decoder: decoding.Decoder,
  provider: TWebSocketProvider
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
  provider: TWebSocketProvider
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
  provider: TWebSocketProvider
) => {
  authProtocol.readAuthMessage(decoder, provider.doc, permissionDeniedHandler);
};
