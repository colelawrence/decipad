import type { Result } from '@decipad/language-interfaces';
import type { ClientWorkerContext } from '@decipad/remote-computer-worker/client';
import type { SerializedResult } from '../types/serializedTypes';
import { createResultDecoder } from './createResultDecoder';

export const decodeRootResult = async (
  ctx: ClientWorkerContext,
  value: SerializedResult
): Promise<Result.Result> => {
  return createResultDecoder(ctx)(value);
};
