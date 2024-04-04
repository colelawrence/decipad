import { useMyEditorRef } from '@decipad/editor-types';
import {
  allowsTextStyling,
  getPathContainingSelection,
} from '@decipad/editor-utils';
import type { UseVirtualFloatingOptions } from '@udecode/plate-floating';
import {
  flip,
  offset,
  useFloatingToolbar,
  useFloatingToolbarState,
} from '@udecode/plate-floating';

const floatingOptions: UseVirtualFloatingOptions = {
  placement: 'top',
  middleware: [
    offset(12),
    flip({
      padding: 12,
      fallbackPlacements: [
        'top-start',
        'top-end',
        'bottom-start',
        'bottom-end',
      ],
    }),
  ],
};

export const useEditorTooltip = () => {
  const editor = useMyEditorRef();

  const floatingToolbarState = useFloatingToolbarState({
    floatingOptions,
  });

  const floatingToolbar = useFloatingToolbar(floatingToolbarState);

  if (editor) {
    if (!allowsTextStyling(editor, getPathContainingSelection(editor))) {
      floatingToolbar.hidden = true;
    }
  }
  return floatingToolbar;
};
