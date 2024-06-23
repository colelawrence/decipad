import type { AutocompleteName } from '..';
import { encodeAutocompleteName } from './encodeAutocompleteName';
import type { SerializedAutocompleteNames } from '../types/serializedTypes';

export const encodeAutoCompleteNames = (
  value: AutocompleteName[]
): SerializedAutocompleteNames => value.map(encodeAutocompleteName);
