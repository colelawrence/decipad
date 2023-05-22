import { Selection } from 'slate';
import { useSelected } from 'slate-react';
import { useCallback } from 'react';
import { useEditorChange } from './useEditorChange';

export const useSelection = (outside: boolean = false): Selection => {
  const isSelected = useSelected();
  return useEditorChange(
    useCallback(
      (editor) => (isSelected || outside ? editor.selection : null),
      [isSelected, outside]
    )
  );
};
