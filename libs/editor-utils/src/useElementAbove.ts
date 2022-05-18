import { dequal } from 'dequal';
import { useCallback, useState } from 'react';
import { EditorAboveOptions, Element, NodeEntry } from 'slate';
import { useEditorChange } from '@decipad/react-contexts';
import { findNodePath, getAboveNode, hasNode } from '@udecode/plate';
import { MyEditor, MyNode } from '@decipad/editor-types';

export const useElementAbove = (
  editor: MyEditor,
  node: MyNode,
  options: EditorAboveOptions<Element>
): Element | undefined => {
  const [entry, setEntry] = useState<NodeEntry<Element> | undefined>(() => {
    const path = findNodePath(editor, node);
    if (path) {
      return getAboveNode(editor, { ...options, at: path });
    }
    return undefined;
  });

  useEditorChange(
    useCallback(() => {
      const path = findNodePath(editor, node);
      if (path && hasNode(editor, path)) {
        const newEntry = getAboveNode(editor, { ...options, at: path });
        if (!dequal(newEntry, entry)) {
          setEntry(newEntry);
        }
      }
    }, [editor, entry, node, options]),
    (e) => {
      const path = findNodePath(e, node);
      if (path && hasNode(editor, path)) {
        return getAboveNode(editor, { ...options, at: path });
      }
      return undefined;
    }
  );

  return entry && entry[0];
};
