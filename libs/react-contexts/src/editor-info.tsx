import { noop } from '@decipad/utils';
import { createContext, useContext, useEffect } from 'react';

export const EditorReadOnlyContext = createContext<{
  readOnly: boolean;
  lockWriting: () => () => void;
}>({
  readOnly: false,
  lockWriting: () => noop,
});
export const useIsEditorReadOnly = (): boolean =>
  useContext(EditorReadOnlyContext).readOnly;

export const useLockEditorWriting = () => {
  const { lockWriting } = useContext(EditorReadOnlyContext);
  useEffect(lockWriting, [lockWriting]);
};

export const EditorIdContext = createContext<string>('');

export const useNotebookId = (): string => useContext(EditorIdContext);
