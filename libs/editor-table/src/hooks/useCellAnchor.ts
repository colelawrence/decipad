import {
  findNodePath,
  useEditorRef,
  useEditorSelection,
  useElement,
} from '@udecode/plate-common';
import { useMemo } from 'react';
import { Path } from 'slate';

export const useCellAnchor = () => {
  const editor = useEditorRef();
  const selection = useEditorSelection();
  const element = useElement();

  return useMemo(() => {
    if (!selection) return false;
    const path = findNodePath(editor, element);
    if (!path) return false;
    return Path.isAncestor(path, selection.anchor.path);
  }, [editor, element, selection]);
};
