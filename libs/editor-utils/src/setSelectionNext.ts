import { MyEditor, MyElementEntry } from '@decipad/editor-types';
import { getNextNode, getNodeString, setSelection } from '@udecode/plate';

/**
 * Sets the selection onto either, the end of the current text, or
 * if we are at the end, sets the selection to the next available node,
 * by finding an available node either on the current path level, or the ones above.
 *
 * @param editor: a reference to the editor object
 * @param entry: The node entry @see `MyElementEntry`
 */
export const setSelectionNext = (
  editor: MyEditor,
  [node, path]: MyElementEntry
) => {
  const text = getNodeString(node);
  if (editor.selection?.anchor.offset === text.length) {
    // Let's find a next node that is available, by gradually
    // moving up a level in the path.
    for (let p = path; p.length > 0; p.pop()) {
      const nextNode = getNextNode(editor, { at: p });
      if (!nextNode) continue;
      setSelection(editor, {
        anchor: {
          offset: 0,
          path: nextNode[1],
        },
        focus: {
          offset: 0,
          path: nextNode[1],
        },
      });
      break;
    }
    return;
  }
  setSelection(editor, {
    anchor: {
      offset: text.length,
      path,
    },
    focus: {
      offset: text.length,
      path,
    },
  });
};
