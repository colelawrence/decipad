import { Selection } from 'slate';
import { useSelected } from 'slate-react';
import { useCallback } from 'react';
import { useEditorChange } from './useEditorChange';

export const useSelection = (): Selection => {
  const isSelected = useSelected();
  return useEditorChange(
    useCallback(
      (editor) => (isSelected ? editor.selection : null),
      [isSelected]
    )
  );
};
