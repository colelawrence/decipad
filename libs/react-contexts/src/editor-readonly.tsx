import { createContext, useContext } from 'react';

export const EditorReadOnlyContext = createContext(true);
export const useIsEditorReadOnly = (): boolean =>
  useContext(EditorReadOnlyContext);
