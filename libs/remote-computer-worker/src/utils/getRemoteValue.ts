import type { ClientWorkerContext } from '../client/types';

export const getRemoteValue = async (
  ctx: ClientWorkerContext,
  valueId: string,
  start = 0,
  end = Infinity
): Promise<ArrayBuffer> => {
  const value = await ctx.rpc.call('getValue', { valueId, start, end });
  if (!(value instanceof ArrayBuffer)) {
    throw new TypeError(
      'Expected ArrayBuffer as remote `getValue()` return type'
    );
  }
  return value;
};
