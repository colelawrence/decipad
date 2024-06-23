import type { ClientWorkerContext } from '../client/types';

const isArrayBuffer = (value: unknown): value is ArrayBuffer => {
  return (
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    (typeof value === 'object' && 'byteLength' in (value as object)) // WTF for tests
  );
};

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
