import { createOnKeyDownPluginFactory } from '@decipad/editor-plugins';
import {
  BlockElement,
  ELEMENT_TD,
  ELEMENT_TH,
  MyEditor,
} from '@decipad/editor-types';
import {
  getBlockAbove,
  getEndPoint,
  hasNode,
  setSelection,
} from '@udecode/plate';
import { Path } from 'slate';

const nextUpOrDown = (
  editor: MyEditor,
  path: Path,
  direction: 1 | -1
): Path | undefined => {
  const keepPath = path.slice(0, path.length - 2);
  const nextPath = [
    ...keepPath,
    path[path.length - 2] + direction,
    path[path.length - 1],
  ];
  if (!hasNode(editor, nextPath)) {
    if (nextPath.length > 2) {
      return nextUpOrDown(editor, keepPath, direction);
    }
    return undefined;
  }
  return nextPath;
};

const move = (editor: MyEditor, path: Path, direction: 1 | -1): boolean => {
  const nextPath = nextUpOrDown(editor, path, direction);
  if (nextPath) {
    const focusPoint = getEndPoint(editor, nextPath);
    // if (hasNode(editor, nextPath)) {
    setSelection(editor, {
      anchor: focusPoint,
      focus: focusPoint,
    });
    return true;
  }
  return false;
};

export const createArrowCellNavigationPlugin = createOnKeyDownPluginFactory({
  name: 'ARROW_CELL_NAVIGATION_PLUGIN',
  plugin: (editor: MyEditor) => (event) => {
    const entry = getBlockAbove<BlockElement>(editor);
    if (!entry) return false;
    const [node, path] = entry;
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
