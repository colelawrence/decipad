'use strict';

import EventEmitter from 'events';
import { Sync } from './sync';

export default function createWebsocketImpl(
  sync: Sync<AnySyncValue>
): typeof WebSocket {
  class WebsocketImpl extends EventEmitter implements WebSocket {
    static readonly CLOSED = WebSocket.CLOSED;
    static readonly CLOSING = WebSocket.CLOSING;
    static readonly CONNECTING = WebSocket.CONNECTING;
    static readonly OPEN = WebSocket.OPEN;

    readonly CLOSED = WebSocket.CLOSED;
    readonly CLOSING = WebSocket.CLOSING;
    readonly CONNECTING = WebSocket.CONNECTING;
    readonly OPEN = WebSocket.OPEN;

    private oncloseCallback: (event: CloseEvent) => any | null;
    private onerrorCallback: (event: Event) => any;
    private onmessageCallback: (event: MessageEvent) => any | null;
    private onopenCallback: (event: Event) => any | null;

    constructor(_url: string, _protocols: string | string[] | undefined) {
      super();
      sync.on('websocket', (ws: WebSocket) => {
        if (this.oncloseCallback) {
          ws.onclose = this.oncloseCallback;
        }
        if (this.onerrorCallback) {
          ws.onerror = this.onerrorCallback;
        }
        if (this.onmessageCallback) {
          ws.onmessage = this.onmessageCallback;
        }
        if (this.onopenCallback) {
          ws.onopen = this.onopenCallback;
        }
      });
    }

    close() {
      throw new Error('This websocket does not close');
    }

    send(data: string | ArrayBufferLike | ArrayBufferView | Blob) {
      if (sync.connection) {
        return sync.connection.send(data);
      }
      throw new Error('send: the websocket connection is not currently open');
    }

    set onclose(callback: (event: CloseEvent) => any | null) {
      this.oncloseCallback = (event: CloseEvent) => {
        this.emit('close');
        callback(event);
      };
      if (sync.connection) {
        sync.connection.onclose = this.oncloseCallback;
      }
    }

    get onclose() {
      return this.oncloseCallback;
    }

    set onerror(callback: (event: Event) => any | null) {
      this.onerrorCallback = callback;
      if (sync.connection) {
        sync.connection.onerror = callback;
      }
    }

    get onerror() {
      return this.onerrorCallback;
    }

    set onmessage(callback) {
      this.onmessageCallback = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (message.type) {
          callback(event);
        }
      };
      if (sync.connection) {
        sync.connection.onmessage = this.onmessageCallback;
      }
    }

    get onmessage() {
      return this.onmessageCallback;
    }

    set onopen(callback) {
      this.onopenCallback = callback;
      if (sync.connection) {
        sync.connection.onopen = this.onopenCallback;
      }
    }

    get onopen() {
      return this.onopenCallback;
    }

    // @ts-expect-error listener definition is complex
    addEventListener(event: string, listener) {
      return this.on(event, listener);
    }

    // @ts-expect-error listener definition is complex
    removeEventListener(event, listener) {
      return this.off(event, listener);
    }

    dispatchEvent(event: Event) {
      return this.emit(event.type, event);
    }

    get readyState(): number {
      if (sync.connection) {
        return sync.connection.readyState;
      } else {
        return WebsocketImpl.CLOSED;
      }
    }

    get binaryType(): BinaryType {
      if (sync.connection) {
        return sync.connection.binaryType;
      }
      throw new Error('do not know');
    }

    get bufferedAmount(): number {
      if (sync.connection) {
        return sync.connection.bufferedAmount;
      }
      throw new Error('do not know');
    }

    get extensions(): string {
      if (sync.connection) {
        return sync.connection.extensions;
      }
      throw new Error('do not know');
    }

    get protocol(): string {
      if (sync.connection) {
        return sync.connection.protocol;
      }
      throw new Error('do not know');
    }

    get url(): string {
      if (sync.connection) {
        return sync.connection.url;
      }
      throw new Error('do not know');
    }
  }

  return WebsocketImpl;
}
