import stringify from 'json-stringify-safe';
import { BaseRange } from 'slate';

export const saveSelection = (
  storageKey: string,
  selection?: Partial<BaseRange> | null
) => {
  if (selection) {
    global.localStorage.setItem(storageKey, stringify(selection));
  }
};
