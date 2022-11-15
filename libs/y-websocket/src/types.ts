import { Doc as YDoc } from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { Observable } from 'lib0/observable';

export type MessageType = 0 | 1 | 2 | 3;

export const messageSync = 0;
export const messageQueryAwareness = 3;
export const messageAwareness = 1;
export const messageAuth = 2;

export type MessageHandler = (
  encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  provider: TWebSocketProvider,
  emitSynced: boolean,
  messageType: MessageType
) => void;

export type TWebSocketProvider = Observable<string> & {
  doc: YDoc;
  readOnly: boolean;
  ws?: WebSocket;
  _WS: typeof WebSocket;
  serverUrl: string | undefined;
  url?: string;
  protocol?: string;
  awareness: awarenessProtocol.Awareness;
  messageHandlers: MessageHandler[];

  wsUnsuccessfulReconnects: number;
  wsLastMessageReceived: number;
  synced: boolean;
  wsconnecting: boolean;
  wsconnected: boolean;
  shouldConnect: boolean;
  destroyed: boolean;

  beforeConnect?: (provider: TWebSocketProvider) => void | Promise<void>;
  connect: () => void;
  send: (buf: Uint8Array) => void;
  disconnect: () => void;
  onError?: (error: Error) => void;
};
