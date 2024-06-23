import type { Result } from '@decipad/language-interfaces';
import type { SerializedResult } from '../types/serializedTypes';
import type { RemoteValueStore } from '@decipad/remote-computer-worker/client';
import { createResultEncoder } from './createResultEncoder';
import type { PromiseOrType } from '@decipad/utils';

export const encodeRootResult = (
  value: Result.Result,
  store: RemoteValueStore
): PromiseOrType<SerializedResult> => createResultEncoder(store)(value);
