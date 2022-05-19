import { Observable } from 'lib0/observable';
import { noop } from '@decipad/utils';
import * as awarenessProtocol from 'y-protocols/awareness';
import { Doc } from 'yjs';
import { messageHandlers } from './messageHandlers';
import { TWebSocketProvider } from './types';

class TestProvider extends Observable<string> implements TWebSocketProvider {
  doc: Doc;
  awareness: awarenessProtocol.Awareness;
  ws?: WebSocket | undefined;
  _WS = WebSocket;
  serverUrl = 'ws://localhost/ws';
  messageHandlers = messageHandlers;
  wsUnsuccessfulReconnects = 0;
  wsLastMessageReceived = 0;
  synced = false;
  wsconnecting = false;
  wsconnected = false;
  shouldConnect = false;
  destroyed = false;
  beforeConnect?:
    | ((provider: TWebSocketProvider) => void | Promise<void>)
    | undefined;
  connect = noop;
  send = noop;
  disconnect = noop;
  onError = (err: Error) => {
    throw err;
  };

  constructor(doc: Doc) {
    super();
    this.doc = doc;
    this.awareness = new awarenessProtocol.Awareness(this.doc);
  }
}

export const createTestProvider = (doc: Doc): TWebSocketProvider => {
  return new TestProvider(doc);
};
