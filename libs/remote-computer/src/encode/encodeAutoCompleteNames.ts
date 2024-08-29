import type { AutocompleteNameWithSerializedType } from '..';
import { encodeAutocompleteName } from './encodeAutocompleteName';
import type { SerializedAutocompleteNames } from '../types/serializedTypes';

export const encodeAutoCompleteNames = (
  value: AutocompleteNameWithSerializedType[]
): SerializedAutocompleteNames => value.map(encodeAutocompleteName);
