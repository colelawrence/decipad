import { EditorAboveOptions, Element, NodeEntry } from 'slate';
import { useEditorChange } from '@decipad/editor-hooks';
import { findNodePath } from '@udecode/plate';
import { MyElement, MyNode } from '@decipad/editor-types';
import { getAboveNodeSafe } from './getAboveNodeSafe';

export const useElementAbove = (
  node: MyNode,
  options: EditorAboveOptions<Element>
): Element | undefined => {
  const entry = useEditorChange<NodeEntry<MyElement> | undefined>((editor) => {
    const path = findNodePath(editor, node);
    if (path) {
      return getAboveNodeSafe(editor, { ...options, at: path });
    }
    return undefined;
  });

  return entry && entry[0];
};
