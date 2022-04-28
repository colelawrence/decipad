import { createContext, FC, ReactNode, useContext } from 'react';

export const EditorReadOnlyContext = createContext(false);
export const EditorIsReadOnlyProvider: FC<{
  children?: ReactNode;
  isEditorReadOnly: boolean;
}> = ({ children, isEditorReadOnly }) => (
  <EditorReadOnlyContext.Provider value={isEditorReadOnly}>
    {children}
  </EditorReadOnlyContext.Provider>
);
export const useIsEditorReadOnly = (): boolean =>
  useContext(EditorReadOnlyContext);
