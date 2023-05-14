import { useEditorChange } from '@decipad/editor-hooks';
import { Selection } from 'slate';
import { useSelected } from 'slate-react';

export const useSelection = (): Selection => {
  const isSelected = useSelected();
  return useEditorChange((editor) => (isSelected ? editor.selection : null));
};
