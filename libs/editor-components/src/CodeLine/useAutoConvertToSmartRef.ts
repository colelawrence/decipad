import { useWasSelected } from '@decipad/editor-hooks';
import { MyElement, useTEditorRef } from '@decipad/editor-types';
import { convertCodeSmartRefs } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { findNodePath, isCollapsed } from '@udecode/plate';
import { useEffect } from 'react';
import { useSelected } from 'slate-react';

type VarAndCol = [string, string?];

// transform variable references into smart refs on blur
// useOnBlurNormalize(editor, element);
export const useAutoConvertToSmartRef = (element?: MyElement) => {
  const editor = useTEditorRef();
  const computer = useComputer();
  const selected = useSelected();

  const wasSelected = useWasSelected();

  // TODO: make `names` more efficient to search
  const names = computer.getNamesDefined$.useWithSelectorDebounced(
    1000,
    (autoCompleteNames) =>
      autoCompleteNames.flatMap((n): [VarAndCol, VarAndCol][] => {
        if (n.kind === 'variable' && n.blockId) {
          return [[[n.name], [n.blockId]]];
        }
        if (n.kind === 'column' && n.blockId && n.columnId) {
          return [
            [n.name.split('.') as [string, string], [n.blockId, n.columnId]],
          ];
        }
        return [];
      }),
    element?.id
  );

  useEffect(() => {
    if (element && (selected || wasSelected) && isCollapsed(editor.selection)) {
      const path = findNodePath(editor, element);
      if (path) {
        convertCodeSmartRefs(editor, path, names);
      }
    }
  }, [editor, element, names, selected, wasSelected]);
};
