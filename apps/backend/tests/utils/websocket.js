'use strict';

const EventEmitter = require('events');

const Websocket = window.WebSocket;

function createWebsocket({ token }) {
  class DeciWebsocket extends EventEmitter {
    static CLOSED = Websocket.CLOSED;
    static CLOSING = Websocket.CLOSING;
    static CONNECTING = Websocket.CONNECTING;
    static OPEN = Websocket.OPEN;

    constructor(url, protocols = []) {
      super();
      if (!Array.isArray(protocols)) {
        protocols = [protocols];
      }

      this.client = new Websocket(url, token);
    }

    get readyState() {
      return this.client.readyState;
    }

    close(code, reason) {
      return this.client.close(code, reason);
    }

    send(data) {
      return this.client.send(data);
    }

    set onclose(callback) {
      this.client.onclose = (event) => {
        this.emit('close');
        callback(event);
      };
    }

    get onclose() {
      return this.client?.onclose;
    }

    set onerror(callback) {
      this.client.onerror = callback;
    }

    get onerror() {
      return this.client.onerror;
    }

    set onmessage(callback) {
      this.client.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'data') {
          // legacy message type.
          // discard
        }
        callback(event);
      };
    }

    get onmessage() {
      return this.client.onmessage;
    }

    set onopen(callback) {
      this.client.onopen = callback;
    }

    get onopen() {
      return this.client.onopen;
    }

    addEventListener(event, listener) {
      return this.on(event, listener);
    }
  }

  return DeciWebsocket;
}

export default createWebsocket;
