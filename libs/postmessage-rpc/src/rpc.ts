import { nanoid } from 'nanoid';
import { EventEmitter } from 'eventemitter3';
import { RPCError } from './error';
import {
  defaultRecievable,
  IMessageEvent,
  IPostable,
  IReceivable,
  IRPCMethod,
  IRPCReply,
  isRPCMessage,
  RPCMessage,
} from './types';

function objToError(obj: { code: number; message: string; path?: string[] }) {
  return new RPCError(obj.code, obj.message, obj.path);
}

/**
 * IRPCOptions are used to construct an RPc instance.
 */
export interface IRPCOptions {
  /**
   * Target window to send messages to, like an iframe.
   */
  target: IPostable;

  /**
   * Unique string that identifies this RPC service. This is used so that
   * multiple RPC instances can communicate on the page without interference.
   * This should be the same on both the sending and receiving end.
   */
  serviceId: string;

  /**
   * Remote origin that we'll communicate with. It may be set to and
   * defaults to '*'.
   */
  origin?: string;

  /**
   * Protocol version that socket will advertise. Defaults to 1.0. You can
   * rev this for compatibility changes between consumers.
   */
  protocolVersion?: string;

  /**
   * Window to read messages from. Defaults to the current window.
   */
  receiver?: IReceivable;
}

/**
 * Magic ID used for the "ready" call.
 */
const magicReadyCallId = 'ready';

/**
 * Primitive postMessage based RPC.
 */
export class RPC extends EventEmitter {
  /**
   * Promise that resolves once the RPC connection is established.
   */
  public readonly isReady: Promise<void>;
  /**
   * A map of IDs to callbacks we'll fire whenever the remote frame responds.
   */
  private calls: Map<string, (err: null | RPCError, result: unknown) => void> =
    new Map();

  /**
   * Protocol version the remote frame advertised.
   */
  private remoteProtocolVersion: string | undefined;

  /**
   * Callback invoked when we destroy this RPC instance.
   */
  private unsubscribeCallback: () => void;

  /**
   * Creates a new RPC instance. Note: you should use the `rpc` singleton,
   * rather than creating this class directly, in your controls.
   */
  constructor(private readonly options: IRPCOptions) {
    super();
    this.unsubscribeCallback = (
      options.receiver || defaultRecievable
    ).readMessages(this.listener);

    // Both sides will fire "ready" when they're set up. When either we get
    // a ready or the other side successfully responds that they're ready,
    // resolve the "ready" promise.
    this.isReady = new Promise<void>((resolve) => {
      const response = { protocolVersion: options.protocolVersion || '1.0' };

      this.expose('ready', () => {
        resolve();
        return response;
      });

      this.call<void>('ready', response).then(resolve).catch(resolve);
    });
  }

  /**
   * Create instantiates a new RPC instance and waits until it's ready
   * before returning.
   */
  static create(options: IRPCOptions): Promise<RPC> {
    const rpc = new RPC(options);
    return rpc.isReady.then(() => rpc);
  }

  /**
   * Attaches a method callable by the other window, to this one. The handler
   * function will be invoked with whatever the other window gives us. Can
   * return a Promise, or the results directly.
   *
   * @param {string} method
   * @param {function(params: any): Promise.<*>|*} handler
   */
  public expose<T>(
    method: string,
    handler: (params: T) => Promise<unknown> | unknown
  ): this {
    this.on(method, (data: IRPCMethod<T>) => {
      if (data.discard) {
        handler(data.params);
        return;
      }

      // tslint:disable-next-line
      new Promise((resolve) => {
        resolve(handler(data.params));
      })
        .then(
          (result) =>
            ({
              type: 'reply',
              serviceID: this.options.serviceId,
              id: data.id,
              result,
            } as IRPCReply<unknown>)
        )
        .catch(
          (err: Error) =>
            ({
              type: 'reply',
              serviceID: this.options.serviceId,
              id: data.id,
              error:
                err instanceof RPCError
                  ? err.toReplyError()
                  : { code: 0, message: err.stack || err.message },
            } as IRPCReply<unknown>)
        )
        .then((packet) => {
          this.post(packet);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Error sending reply', err);
        });
    });

    return this;
  }

  public call<T>(
    method: string,
    params: object,
    waitForReply?: true
  ): Promise<T>;
  public call(method: string, params: object, waitForReply: false): void;

  /**
   * Makes an RPC call out to the target window.
   *
   * @param {string} method
   * @param {*} params
   * @param {boolean} [waitForReply=true]
   * @return {Promise.<object> | undefined} If waitForReply is true, a
   * promise is returned that resolves once the server responds.
   */
  public call<T>(
    method: string,
    params: object,
    waitForReply: boolean = true
  ): Promise<T> | void {
    const id = method === 'ready' ? magicReadyCallId : nanoid();
    const packet: IRPCMethod<unknown> = {
      type: 'method',
      serviceID: this.options.serviceId,
      id,
      params,
      method,
      discard: !waitForReply,
    };

    this.post(packet);

    if (!waitForReply) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.calls.set(id, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res as T);
        }
      });
    });
  }

  /**
   * Tears down resources associated with the RPC client.
   */
  public destroy() {
    this.unsubscribeCallback();
  }

  /**
   * Returns the protocol version that the remote client implements. This
   * will return `undefined` until we get a `ready` event.
   * @return {string | undefined}
   */
  public remoteVersion(): string | undefined {
    return this.remoteProtocolVersion;
  }

  private handleReply(packet: IRPCReply<unknown>) {
    const handler = this.calls.get(packet.id);
    if (!handler) {
      return;
    }

    if (packet.error) {
      handler(objToError(packet.error), null);
    } else {
      handler(null, packet.result);
    }

    this.calls.delete(packet.id);
  }

  private post<T>(message: RPCMessage<T>) {
    this.options.target.postMessage(message, this.options.origin || '*');
  }

  private isReadySignal(packet: RPCMessage<unknown>) {
    if (packet.type === 'method' && packet.method === 'ready') {
      return true;
    }

    if (packet.type === 'reply' && packet.id === magicReadyCallId) {
      return true;
    }

    return false;
  }

  private listener = (ev: IMessageEvent) => {
    // If we got data that wasn't a string or could not be parsed, or was
    // from a different remote, it's not for us.
    if (
      this.options.origin &&
      this.options.origin !== '*' &&
      ev.origin !== this.options.origin
    ) {
      return;
    }

    let packet: RPCMessage<unknown>;
    try {
      packet = ev.data as RPCMessage<unknown>;
    } catch (e) {
      return;
    }

    if (!isRPCMessage(packet) || packet.serviceID !== this.options.serviceId) {
      return;
    }

    if (this.isReadySignal(packet)) {
      const params: { protocolVersion: string } | undefined = (
        packet.type === 'method' ? packet.params : packet.result
      ) as { protocolVersion: string };
      if (params && params.protocolVersion) {
        this.remoteProtocolVersion = params.protocolVersion;
      } else {
        this.remoteProtocolVersion = '1.0';
      }
    }

    this.dispatchIncoming(packet);
  };

  private dispatchIncoming(packet: RPCMessage<unknown>) {
    switch (packet.type) {
      case 'method':
        if (this.listeners(packet.method).length > 0) {
          this.emit(packet.method, packet);
          return;
        }

        this.post({
          type: 'reply',
          serviceID: this.options.serviceId,
          id: packet.id,
          error: {
            code: 4003,
            message: `Unknown method name "${packet.method}"`,
          },
          result: null,
        });
        break;
      case 'reply':
        this.handleReply(packet);
        break;
      default:
      // Ignore
    }
  }
}
