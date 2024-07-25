/**
 * Describes an RPC method call.
 */
export interface IRPCMethod<T> {
  type: 'method';
  serviceID: string;
  id: string;
  method: string;
  discard?: boolean;
  params: T;
}

/**
 * Describes an RPC method reply.
 */
export interface IRPCReply<T> {
  type: 'reply';
  serviceID: string;
  id: string;
  result: T;
  error?: {
    code: number;
    message: string;
    path?: string[];
  };
}

/**
 * Defines any message sentable over RPC.
 */
export type RPCMessage<T> = IRPCMethod<T> | IRPCReply<T>;

/**
 * Checks whether the message duck-types into an Interactive message.
 * This is needed to distinguish between postmessages that we get,
 * and postmessages from other sources.
 */
export function isRPCMessage(data: unknown): data is RPCMessage<unknown> {
  return (
    data != null &&
    typeof data === 'object' &&
    'type' in data &&
    (data.type === 'method' || data.type === 'reply')
  );
}

/**
 * Describes a PostMessage event that the RPC will read. A subset of the
 * MessageEvent DOM type.
 */
export interface IMessageEvent {
  data: unknown;
  origin: string;
}

/**
 * IPostable is an interface that describes something to which we can send a
 * browser postMessage. It's implemented by the `window`, and is mocked
 * in tests.
 */
export interface IPostable {
  postMessage(data: unknown, targetOrigin: string): void;
}

/**
 * IRecievable is an interface that describes something from wheich we can
 * read a browser postMessage. It's implemented by the `window`, and is mocked
 * in tests.
 */
export interface IReceivable {
  /**
   * Takes a callback invoked to invoke whenever a message is received,
   * and returns a function the can be used to unsubscribe the callback.
   */
  readMessages(callback: (ev: IMessageEvent) => void): () => void;
}

/**
 * Default `IRecievable` implementation that listens on the window.
 */
export const defaultRecievable: IReceivable = {
  readMessages(callback) {
    window.addEventListener('message', callback);
    return () => window.removeEventListener('message', callback);
  },
};
