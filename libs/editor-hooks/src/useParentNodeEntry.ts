import { useCallback } from 'react';
import type { MyNode } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import type { TNodeEntry } from '@udecode/plate-common';
import { findNodePath, getParentNode } from '@udecode/plate-common';
import { useEditorChange } from './useEditorChange';

export const useParentNodeEntry = <TRNode extends MyNode = MyNode>(
  node: MyNode
): TNodeEntry<TRNode> | undefined => {
  const editor = useMyEditorRef();

  return useEditorChange(
    useCallback((): TNodeEntry<TRNode> | undefined => {
      const path = findNodePath(editor, node);
      return (
        path && (getParentNode(editor, path) as TNodeEntry<TRNode> | undefined)
      );
    }, [editor, node])
  );
};
