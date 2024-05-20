import { RPC } from '@mixer/postmessage-rpc';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class SharedRPC extends RPC {
  // RPC implementation that does not use `JSON.serialize`.
  // Instead, we post the data object directly and then let the worker figure it out.
  // This is important so that we preserve the ArrayBuffers we might be embedding in the message.

  post(data: object): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    data.counter = this.callCounter++;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.options.target.postMessage(data, this.options.origin || '*');
  }
}
