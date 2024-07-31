import { useEditorChange } from '@decipad/editor-hooks';
import { useMyEditorRef } from '@decipad/editor-types';
import {
  allowsTextStyling,
  getPathContainingSelection,
} from '@decipad/editor-utils';
import { isCollapsed } from '@udecode/plate-common';
import type { UseVirtualFloatingOptions } from '@udecode/plate-floating';
import {
  flip,
  offset,
  useFloatingToolbar,
  useFloatingToolbarState,
} from '@udecode/plate-floating';
import { useCallback, useEffect, useMemo } from 'react';

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

  const hidden = useEditorChange(
    useCallback(
      (e) => {
        const hide =
          isCollapsed(editor.selection) ||
          !allowsTextStyling(e, getPathContainingSelection(e));
        return hide;
      },
      [editor.selection]
    ),
    {
      debounceTimeMs: 0,
    }
  );

  const floatingToolbarState = useFloatingToolbarState({
    hideToolbar: hidden,
    editorId: editor.id,
    floatingOptions: useMemo(
      () => ({ ...floatingOptions, open: !hidden }),
      [hidden]
    ),
    focusedEditorId: null,
  });

  useEffect(() => {
    if (!hidden && !floatingToolbarState.open) {
      floatingToolbarState.setOpen(true);
    } else if (hidden && floatingToolbarState.open) {
      floatingToolbarState.setOpen(false);
    }
  }, [floatingToolbarState, hidden]);

  return useFloatingToolbar(floatingToolbarState);
};
