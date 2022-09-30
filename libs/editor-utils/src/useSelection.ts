import { useEditorSelector } from '@decipad/react-contexts';
import { Selection } from 'slate';
import { useSelected } from 'slate-react';

export const useSelection = (): Selection => {
  const isSelected = useSelected();
  return useEditorSelector((editor) => (isSelected ? editor.selection : null));
};
