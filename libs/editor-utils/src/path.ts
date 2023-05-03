import { Path } from 'slate';
import { isBlock, isElement, isText, TEditor } from '@udecode/plate';
import { getAboveNodeSafe } from './getAboveNodeSafe';
import { getNodeEntrySafe } from './getNodeEntrySafe';

export const getBlockParentPath = (
  editor: TEditor,
  path: Path
): Path | null => {
  const currentBlockPath = isBlock(editor, getNodeEntrySafe(editor, path)?.[0])
    ? path
    : getAboveNodeSafe(editor, {
        at: path,
        match: (node) => isBlock(editor, node),
      })?.[1];

  return currentBlockPath ?? null;
};
export const requireBlockParentPath = (editor: TEditor, path: Path): Path => {
  const blockParentPath = getBlockParentPath(editor, path);
  if (!blockParentPath) {
    throw new Error('Cannot find block parent');
  }
  return blockParentPath;
};

export const requirePathBelowBlock = (editor: TEditor, path: Path): Path => {
  return Path.next(requireBlockParentPath(editor, path));
};

export const getNonTextParentPath = (
  editor: TEditor,
  path: Path
): Path | null => {
  const nodeEntry = getNodeEntrySafe(editor, path)?.[0];
  const currentBlockPath =
    isElement(nodeEntry) && !isText(nodeEntry)
      ? path
      : getAboveNodeSafe(editor, {
          at: path,
          match: (node) => isElement(node) && !isText(node),
        })?.[1];

  return currentBlockPath ?? null;
};
