import { MyEditor } from '@decipad/editor-types';
import { getParentNode, getStartPoint, hasNode } from '@udecode/plate';
import { Path } from 'slate';
import { setSelection } from './setSelection';

export const relocateSelectionAfterRemoveIfNecessary = (
  editor: MyEditor,
  removedPath: Path
): void => {
  const { selection } = editor;
  if (selection) {
    for (const point of [selection.focus, selection.anchor]) {
      if (
        Path.equals(removedPath, point.path) ||
        Path.isAncestor(removedPath, point.path)
      ) {
        const parentEntry = getParentNode(editor, point);
        if (parentEntry) {
          const [, parentPath] = parentEntry;
          const startPoint = getStartPoint(editor, parentPath);
          if (hasNode(editor, parentPath)) {
            setSelection(editor, { anchor: startPoint, focus: startPoint });
          }
        }
      }
    }
  }
};
