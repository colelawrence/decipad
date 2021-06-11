import EventEmitter from 'events';

let websocketIndex = 0;

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

    private idx = ++websocketIndex;
    private closing = false;

    constructor(url: string, protocols: string[] | string | undefined = []) {
      super();
      if (!Array.isArray(protocols)) {
        protocols = [protocols];
      }

      this.client = new WebSocket(url, token);
    }

    get readyState() {
      return this.client.readyState;
    }

    close(code: number | undefined, reason: string | undefined) {
      this.closing = true;
      return this.client.close(code, reason);
    }

    send(data: string | ArrayBufferLike | ArrayBufferView | Blob) {
      return this.client.send(data);
    }

    set onclose(callback: (ev: CloseEvent) => any) {
      this.client.onclose = (event: CloseEvent) => {
        if (!this.closing) {
          throw new Error('Websocket should not have closed');
        }
        console.log('websocket %d: closed', this.idx);
        this.emit('close');
        return callback(event);
      };
    }

    get onclose() {
      return this.client?.onclose?.bind(this);
    }

    set onerror(callback: (ev: Event) => any) {
      this.client.onerror = (ev: Event) => {
        return callback(ev);
      };
    }

    get onerror() {
      return this.client.onerror?.bind(this);
    }

    set onmessage(callback: (ev: MessageEvent<any>) => any) {
      this.client.onmessage = (ev: MessageEvent<any>) => {
        return callback(ev);
      };
    }

    get onmessage() {
      return this.client.onmessage?.bind(this);
    }

    set onopen(callback: (ev: Event) => any) {
      this.client.onopen = (ev: Event) => {
        return callback(ev);
      };
    }

    get onopen() {
      return this.client.onopen?.bind(this);
    }

    addEventListener(event: string, listener: (ev: Event) => any) {
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

    removeEventListener(event: string, listener: (ev: Event) => any) {
      return this.off(event, listener);
    }

    dispatchEvent(event: Event) {
      return this.emit(event.type, event);
    }
  }

  return DeciWebsocket;
}

export default createWebsocket;
