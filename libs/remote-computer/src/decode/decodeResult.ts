import type { ClientWorkerContext } from '@decipad/remote-computer-worker/client';
import { createResultDecoder } from './createResultDecoder';
import type { PromiseOrType } from '@decipad/utils';
import type { SerializedResult } from '../types/serializedTypes';
import type { Result } from '@decipad/language-interfaces';

export const decodeRootResult = (
  context: ClientWorkerContext,
  result: SerializedResult
): PromiseOrType<Result.Result> => createResultDecoder(context)(result);
