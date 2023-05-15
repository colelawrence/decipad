import { useCallback } from 'react';
import { MyNode, useTEditorRef } from '@decipad/editor-types';
import { TNodeEntry, getParentNode } from '@udecode/plate';
import { useNodePath } from './useNodePath';
import { useEditorChange } from './useEditorChange';

export const useParentNodeEntry = <TRNode extends MyNode = MyNode>(
  node: MyNode
): TNodeEntry<TRNode> | undefined => {
  const path = useNodePath(node);
  const editor = useTEditorRef();

  return useEditorChange(
    useCallback(
      (): TNodeEntry<TRNode> | undefined =>
        path && (getParentNode(editor, path) as TNodeEntry<TRNode> | undefined),
      [editor, path]
    )
  );
};
