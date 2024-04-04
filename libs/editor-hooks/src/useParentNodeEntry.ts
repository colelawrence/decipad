import { useCallback } from 'react';
import type { MyNode } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import type { TNodeEntry } from '@udecode/plate-common';
import { getParentNode } from '@udecode/plate-common';
import { useNodePath } from './useNodePath';
import { useEditorChange } from './useEditorChange';

export const useParentNodeEntry = <TRNode extends MyNode = MyNode>(
  node: MyNode
): TNodeEntry<TRNode> | undefined => {
  const path = useNodePath(node);
  const editor = useMyEditorRef();

  return useEditorChange(
    useCallback(
      (): TNodeEntry<TRNode> | undefined =>
        path && (getParentNode(editor, path) as TNodeEntry<TRNode> | undefined),
      [editor, path]
    )
  );
};
