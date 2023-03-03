import { EditorAboveOptions, Element, NodeEntry } from 'slate';
import { useEditorSelector } from '@decipad/react-contexts';
import { findNodePath } from '@udecode/plate';
import { MyElement, MyNode } from '@decipad/editor-types';
import { getAboveNodeSafe } from './getAboveNodeSafe';

export const useElementAbove = (
  node: MyNode,
  options: EditorAboveOptions<Element>
): Element | undefined => {
  const entry = useEditorSelector<NodeEntry<MyElement> | undefined>(
    (editor) => {
      const path = findNodePath(editor, node);
      if (path) {
        return getAboveNodeSafe(editor, { ...options, at: path });
      }
      return undefined;
    }
  );

  return entry && entry[0];
};
