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

    private oncloseCallback?: (event: CloseEvent) => any;
    private onerrorCallback?: (event: Event) => any;
    private onmessageCallback?: (event: MessageEvent) => any;
    private onopenCallback?: (event: Event) => any;

    constructor(_url: string, _protocols: string | string[] | undefined) {
      super();
      this.onWebSocket = this.onWebSocket.bind(this);
      sync.on('websocket', this.onWebSocket);
    }

    close() {
      sync.off('websocket', this.onWebSocket);
      sync.close();
    }

    onWebSocket(ws: WebSocket) {
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
    }

    send(data: string | ArrayBufferLike | ArrayBufferView | Blob) {
      if (!sync.connection) {
        sync.connect(true); // force
        sync.once('websocket', (websocket) => {
          websocket.send(data);
        });
      } else {
        return sync.connection.send(data);
      }
    }

    set onclose(callback: (event: CloseEvent) => any | null) {
      if (this.oncloseCallback) {
        sync.off('websocket close', this.oncloseCallback);
      }
      this.oncloseCallback = (event: CloseEvent) => {
        if (this.onopenCallback) {
          sync.off('websocket open', this.onopenCallback);
        }
        if (this.oncloseCallback) {
          sync.off('websocket close', this.oncloseCallback);
        }
        if (this.onerrorCallback) {
          sync.off('websocket error', this.onerrorCallback);
        }
        if (this.onmessageCallback) {
          sync.off('websocket message', this.onmessageCallback);
        }
        this.oncloseCallback = undefined;
        this.onerrorCallback = undefined;
        this.onmessageCallback = undefined;
        this.onopenCallback = undefined;
        this.emit('close');
        callback(event);
      };
      sync.on('websocket close', this.oncloseCallback);
    }

    get onclose() {
      return this.oncloseCallback!;
    }

    set onerror(callback: (event: Event) => any | null) {
      if (this.onerrorCallback) {
        sync.off('websocket error', this.onerrorCallback);
      }
      this.onerrorCallback = callback;
      sync.on('websocket error', this.onerrorCallback);
    }

    get onerror() {
      return this.onerrorCallback!;
    }

    set onmessage(callback) {
      if (this.onmessageCallback) {
        sync.off('websocket message', this.onmessageCallback);
      }
      this.onmessageCallback = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (message.type) {
          callback!(event);
        }
      };
      sync.on('websocket message', this.onmessageCallback);
    }

    get onmessage() {
      return this.onmessageCallback!;
    }

    set onopen(callback) {
      if (this.onopenCallback) {
        sync.off('websocket open', this.onopenCallback);
      }
      this.onopenCallback = callback;
      sync.on('websocket open', this.onopenCallback!);
    }

    get onopen() {
      return this.onopenCallback!;
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
      if (sync.connecting) {
        return WebsocketImpl.CONNECTING;
      }
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
