import { dequal } from 'dequal';
import { useCallback, useState } from 'react';
import { Editor, EditorAboveOptions, Element, Node, NodeEntry } from 'slate';
import { ReactEditor } from 'slate-react';
import { useEditorChange } from '@decipad/react-contexts';
import { findPath } from './findPath';

export const useElementAbove = (
  editor: ReactEditor,
  node: Node,
  options: EditorAboveOptions<Element>
): Element | undefined => {
  const [entry, setEntry] = useState<NodeEntry<Element> | undefined>(() => {
    const path = findPath(editor, node);
    if (path) {
      return Editor.above(editor, { ...options, at: path });
    }
    return undefined;
  });

  useEditorChange(
    useCallback(() => {
      const path = findPath(editor, node);
      if (path && Editor.hasPath(editor, path)) {
        const newEntry = Editor.above(editor, { ...options, at: path });
        if (!dequal(newEntry, entry)) {
          setEntry(newEntry);
        }
      }
    }, [editor, entry, node, options]),
    (e) => {
      const path = findPath(e, node);
      if (path && Editor.hasPath(editor, path)) {
        return Editor.above(editor, { ...options, at: path });
      }
      return undefined;
    }
  );

  return entry && entry[0];
};
