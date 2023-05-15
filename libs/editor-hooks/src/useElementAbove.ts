import type { EditorAboveOptions, Element, NodeEntry } from 'slate';
import type { MyElement, MyNode } from '@decipad/editor-types';
import { getAboveNodeSafe } from '@decipad/editor-utils';
import { useCallback } from 'react';
import { useNodePath } from './useNodePath';
import { useEditorChange } from './useEditorChange';

export const useElementAbove = (
  node: MyNode,
  options: EditorAboveOptions<Element>
): Element | undefined => {
  const path = useNodePath(node);
  const entry = useEditorChange<NodeEntry<MyElement> | undefined>(
    useCallback(
      (editor) => {
        if (path) {
          return getAboveNodeSafe(editor, { ...options, at: path });
        }
        return undefined;
      },
      [options, path]
    )
  );

  return entry && entry[0];
};
