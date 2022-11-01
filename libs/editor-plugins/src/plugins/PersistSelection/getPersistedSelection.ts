import { MyEditor } from '@decipad/editor-types';
import { BaseSelection } from 'slate';
import { selectionStorageKey } from './selectionStorageKey';

export const getPersistedSelection = (
  editor: MyEditor
): BaseSelection | null => {
  const storageKey = selectionStorageKey(editor);
  try {
    const encodedSelection = global.localStorage.getItem(storageKey);
    if (encodedSelection) {
      return JSON.parse(encodedSelection);
    }
  } catch (err) {
    console.warn(`Error parsing selection: ${(err as Error).message}`);
  }
  return null;
};
