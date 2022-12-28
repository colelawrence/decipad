import {
  CodeLineElement,
  CodeLineV2ElementCode,
  MyEditor,
  MyElement,
  TableColumnFormulaElement,
  TableElement,
} from '@decipad/editor-types';
import { findNodePath } from '@udecode/plate';
import { useEffect } from 'react';
import { useSelected } from 'slate-react';

export const useOnBlurNormalize = (
  editor: MyEditor,
  element:
    | CodeLineV2ElementCode
    | CodeLineElement
    | TableColumnFormulaElement
    | TableElement,
  targetNode?: MyElement
) => {
  const selected = useSelected();
  useEffect(() => {
    // allows onBlur in one element trigger normalize on another
    const nodeToNormalize = targetNode || element;
    if (!selected) {
      const path = findNodePath(editor, nodeToNormalize);
      // in some CodeLine component tests path won't be defined
      if (path) {
        editor.normalizeNode([nodeToNormalize, path]);
      }
    }
  }, [selected, editor, element, targetNode]);
};
