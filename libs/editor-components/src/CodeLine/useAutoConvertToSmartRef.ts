import { MyElement, useTEditorRef } from '@decipad/editor-types';
import { convertCodeSmartRefs, useWasSelected } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { findNodePath, isCollapsed } from '@udecode/plate';
import { useEffect } from 'react';
import { useSelected } from 'slate-react';

// transform variable references into smart refs on blur
// useOnBlurNormalize(editor, element);
export const useAutoConvertToSmartRef = (element: MyElement) => {
  const editor = useTEditorRef();
  const computer = useComputer();
  const selected = useSelected();

  const wasSelected = useWasSelected();

  useEffect(() => {
    if ((selected || wasSelected) && isCollapsed(editor.selection)) {
      const path = findNodePath(editor, element);
      if (path) {
        convertCodeSmartRefs(editor, path, computer);
      }
    }
  }, [computer, editor, element, selected, editor.selection, wasSelected]);
};
