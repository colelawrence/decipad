import { useTPlateEditorRef } from '@decipad/editor-types';
import {
  allowsTextStyling,
  getPathContainingSelection,
} from '@decipad/editor-utils';
import { useFloatingToolbar } from '@udecode/plate';

export const useEditorTooltip = () => {
  const editor = useTPlateEditorRef();
  const floatingToolbar = useFloatingToolbar();

  if (editor) {
    if (!allowsTextStyling(editor, getPathContainingSelection(editor))) {
      floatingToolbar.open = false;
    }
  }
  return floatingToolbar;
};
