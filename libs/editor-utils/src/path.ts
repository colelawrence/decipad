import { Path } from 'slate';
import {
  getAboveNode,
  getNodeEntry,
  isBlock,
  isElement,
  isText,
  TEditor,
} from '@udecode/plate';

export const getBlockParentPath = (
  editor: TEditor,
  path: Path
): Path | null => {
  const currentBlockPath = isBlock(editor, getNodeEntry(editor, path)[0])
    ? path
    : getAboveNode(editor, {
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
  const nodeEntry = getNodeEntry(editor, path)[0];
  const currentBlockPath =
    isElement(nodeEntry) && !isText(nodeEntry)
      ? path
      : getAboveNode(editor, {
          at: path,
          match: (node) => isElement(node) && !isText(node),
        })?.[1];

  return currentBlockPath ?? null;
};
