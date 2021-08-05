import EventEmitter from 'events';

function createWebsocket(token: string): typeof WebSocket {
  class DeciWebsocket extends EventEmitter implements WebSocket {
    static CLOSED = WebSocket.CLOSED;
    static CLOSING = WebSocket.CLOSING;
    static CONNECTING = WebSocket.CONNECTING;
    static OPEN = WebSocket.OPEN;

    readonly CLOSED = WebSocket.CLOSED;
    readonly CLOSING = WebSocket.CLOSING;
    readonly CONNECTING = WebSocket.CONNECTING;
    readonly OPEN = WebSocket.OPEN;

    private client: WebSocket;

    constructor(url: string, protocol: string[] | string | undefined = []) {
      super();
      const protocols = Array.isArray(protocol) ? protocol : [protocol];
      protocols.push(token);

      this.client = new WebSocket(url, protocols);
    }

    get readyState() {
      return this.client.readyState;
    }

    close(code: number | undefined, reason: string | undefined) {
      return this.client.close(code, reason);
    }

    send(data: string | ArrayBufferLike | ArrayBufferView | Blob) {
      return this.client.send(data);
    }

    set onclose(callback: null | ((ev: CloseEvent) => unknown)) {
      this.client.onclose = (event: CloseEvent) => {
        this.emit('close');
        return callback?.(event);
      };
    }

    get onclose() {
      return this.client.onclose?.bind(this) ?? null;
    }

    set onerror(callback: null | ((ev: Event) => unknown)) {
      this.client.onerror = (ev: Event) => {
        return callback?.(ev);
      };
    }

    get onerror() {
      return this.client.onerror?.bind(this) ?? null;
    }

    set onmessage(callback: null | ((ev: MessageEvent<unknown>) => unknown)) {
      this.client.onmessage = (ev: MessageEvent<unknown>) => {
        return callback?.(ev);
      };
    }

    get onmessage() {
      return this.client.onmessage?.bind(this) ?? null;
    }

    set onopen(callback: null | ((ev: Event) => unknown)) {
      this.client.onopen = (ev: Event) => {
        return callback?.(ev);
      };
    }

    get onopen() {
      return this.client.onopen?.bind(this) ?? null;
    }

    addEventListener(event: string, listener: (ev: Event) => unknown) {
      return this.on(event, listener);
    }

    get binaryType(): BinaryType {
      return this.client.binaryType;
    }

    get bufferedAmount(): number {
      return this.client.bufferedAmount;
    }

    get extensions(): string {
      return this.client.extensions;
    }

    get protocol(): string {
      return this.client.protocol;
    }

    get url(): string {
      return this.client.url;
    }

    removeEventListener(event: string, listener: (ev: Event) => unknown) {
      return this.off(event, listener);
    }

    dispatchEvent(event: Event) {
      return this.emit(event.type, event);
    }
  }

  return DeciWebsocket;
}

export default createWebsocket;
