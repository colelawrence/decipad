import { EditorAboveOptions, Element, NodeEntry } from 'slate';
import { useEditorSelector } from '@decipad/react-contexts';
import { findNodePath, getAboveNode } from '@udecode/plate';
import { MyNode } from '@decipad/editor-types';

export const useElementAbove = (
  node: MyNode,
  options: EditorAboveOptions<Element>
): Element | undefined => {
  const entry = useEditorSelector<NodeEntry<Element> | undefined>((editor) => {
    const path = findNodePath(editor, node);
    if (path) {
      return getAboveNode(editor, { ...options, at: path });
    }
    return undefined;
  });

  return entry && entry[0];
};
