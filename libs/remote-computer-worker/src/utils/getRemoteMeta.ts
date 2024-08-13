import { Result } from '@decipad/language-interfaces';
import type { ClientWorkerContext } from '../client/types';
import { isArrayBuffer } from './isArrayBuffer';
import { decodeMetaLabels } from '../client/decodeMetaLabels';

const getRemoteMetaEncoded = async (
  ctx: ClientWorkerContext,
  valueId: string,
  start = 0,
  end = Infinity
): Promise<ArrayBuffer> => {
  const value = await ctx.rpc.call('getMeta', { valueId, start, end });
  if (!isArrayBuffer(value)) {
    // eslint-disable-next-line no-console
    console.error('value was', value);
    throw new TypeError(
      'Expected ArrayBuffer as remote `getValue()` return type'
    );
  }
  return value;
};

export const getRemoteMeta = async (
  ctx: ClientWorkerContext,
  valueId: string,
  start = 0,
  end = Infinity
): Promise<NonNullable<Awaited<Result.ResultMetadataColumn['labels']>>> => {
  const buffer = await getRemoteMetaEncoded(ctx, valueId, start, end);
  return buffer && decodeMetaLabels(buffer);
};
