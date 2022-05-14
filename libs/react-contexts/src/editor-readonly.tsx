import { createContext, useContext } from 'react';

export const EditorReadOnlyContext = createContext(false);
export const useIsEditorReadOnly = (): boolean =>
  useContext(EditorReadOnlyContext);
