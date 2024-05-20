import type { Observable } from 'rxjs';

export class MockWorker implements Worker {
  private eventListeners = new Map<string, Array<unknown>>();

  private send: (message: unknown) => void;

  onmessage = null;
  onmessageerror = null;
  onerror = null;

  constructor(send: (message: unknown) => void, receive: Observable<unknown>) {
    this.send = send;
    receive.subscribe((message) => {
      const eventListeners = this.eventListeners.get('message');
      if (eventListeners?.length) {
        eventListeners.forEach((listener) => {
          const event = {
            data: message,
            origin: '*',
          };
          (listener as (ev: unknown) => void)(event);
        });
      } else {
        throw new Error('No message event listeners');
      }
    });
  }

  postMessage(message: unknown) {
    this.send(message);
  }

  addEventListener<K extends keyof WorkerEventMap>(
    type: string,
    _listener:
      | EventListenerOrEventListenerObject
      | ((this: Worker, ev: WorkerEventMap[K]) => unknown)
  ) {
    let listener = _listener;
    const eventListeners = this.eventListeners.get(type) || [];

    if (typeof listener !== 'function') {
      listener = listener.handleEvent;
    }
    eventListeners.push(listener);
    this.eventListeners.set(type, eventListeners);
  }

  removeEventListener<K extends keyof WorkerEventMap>(
    type: string,
    _listener:
      | EventListenerOrEventListenerObject
      | ((this: Worker, ev: WorkerEventMap[K]) => unknown)
  ) {
    let listener = _listener;
    const eventListeners = this.eventListeners.get(type);
    if (eventListeners) {
      if (typeof listener !== 'function') {
        listener = listener.handleEvent;
      }
      this.eventListeners.set(
        type,
        eventListeners.filter((l) => l !== listener)
      );
    }
  }

  dispatchEvent(): boolean {
    throw new Error('Method not implemented.');
  }

  terminate() {
    // eslint-disable-next-line no-console
    console.debug('Worker terminated');
  }
}
