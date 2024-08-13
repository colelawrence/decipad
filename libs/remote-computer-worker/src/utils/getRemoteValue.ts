import type { ClientWorkerContext } from '../client/types';
import { isArrayBuffer } from './isArrayBuffer';

export const getRemoteValue = async (
  ctx: ClientWorkerContext,
  valueId: string,
  start = 0,
  end = Infinity
): Promise<ArrayBuffer> => {
  const value = await ctx.rpc.call('getValue', { valueId, start, end });
  if (!isArrayBuffer(value)) {
    // eslint-disable-next-line no-console
    console.error('value was', value);
    throw new TypeError(
      'Expected ArrayBuffer as remote `getValue()` return type'
    );
  }
  return value;
};
