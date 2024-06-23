import type { ClientWorkerContext } from '@decipad/remote-computer-worker/client';
import { decodeAutocompleteName } from './decodeAutocompleteName';
import type { SerializedAutocompleteNames } from '../types/serializedTypes';

export const decodeAutoCompleteNames = (
  _ctx: ClientWorkerContext,
  value: SerializedAutocompleteNames
) => value.map(decodeAutocompleteName);
