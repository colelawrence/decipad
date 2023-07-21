import stringify from 'json-stringify-safe';
import { BaseRange } from 'slate';

let showedError = false;

export const saveSelection = (
  storageKey: string,
  selection?: Partial<BaseRange> | null
) => {
  if (selection) {
    try {
      global.localStorage.setItem(storageKey, stringify(selection));
    } catch (err) {
      if (!showedError) {
        showedError = true;
        console.error('Error saving selection', err);
      }
    }
  }
};
