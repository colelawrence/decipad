import { createOnKeyDownPluginFactory } from '@decipad/editor-plugins';
import { BlockElement, ELEMENT_TD, ELEMENT_TH } from '@decipad/editor-types';
import { getBlockAbove, TEditor } from '@udecode/plate';
import { Editor, NodeEntry, Path, Transforms } from 'slate';

const nextUpOrDown = (
  editor: TEditor,
  path: Path,
  direction: 1 | -1
): Path | undefined => {
  const keepPath = path.slice(0, path.length - 2);
  const nextPath = [
    ...keepPath,
    path[path.length - 2] + direction,
    path[path.length - 1],
  ];
  if (!Editor.hasPath(editor, nextPath)) {
    if (nextPath.length > 2) {
      return nextUpOrDown(editor, keepPath, direction);
    }
    return undefined;
  }
  return nextPath;
};

const move = (editor: TEditor, path: Path, direction: 1 | -1): boolean => {
  const nextPath = nextUpOrDown(editor, path, direction);
  if (nextPath) {
    const focusPoint = Editor.end(editor, nextPath);
    // if (Editor.hasPath(editor, nextPath)) {
    Transforms.setSelection(editor, {
      anchor: focusPoint,
      focus: focusPoint,
    });
    return true;
  }
  return false;
};

export const createArrowCellNavigationPlugin = createOnKeyDownPluginFactory({
  name: 'ARROW_CELL_NAVIGATION_PLUGIN',
  plugin: (editor: TEditor) => (event) => {
    const entry = getBlockAbove(editor);
    if (!entry) return false;
    const [node, path] = entry as NodeEntry<BlockElement>;
    const dir =
      event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : null;
    if (dir == null) {
      return false;
    }
    if (node.type === ELEMENT_TD || node.type === ELEMENT_TH) {
      if (move(editor, path, dir)) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    }
    return false;
  },
});
