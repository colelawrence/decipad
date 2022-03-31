import {
  CodeBlockElement,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@decipad/editor-types';
import { getAbove, insertNodes, TDescendant, TEditor } from '@udecode/plate';
import { Editor, Path, Transforms } from 'slate';
import {
  requireBlockParentPath,
  requirePathBelowBlock,
} from '@decipad/editor-utils';

const codeLineElement = {
  type: ELEMENT_CODE_LINE,
  children: [{ text: '' }],
} as const;

export const insertCodeLineBelow = (
  editor: TEditor,
  path: Path,
  select = false
): void => {
  insertNodes<TDescendant>(editor, codeLineElement, {
    at: requirePathBelowBlock(editor, path),
    select,
  });
};

export const insertCodeLineBelowOrReplace = (
  editor: TEditor,
  path: Path,
  select = false
): void => {
  const blockPath = requireBlockParentPath(editor, path);
  const isBlockEmpty = !Editor.string(editor, blockPath);

  insertCodeLineBelow(editor, blockPath, select);
  if (isBlockEmpty) {
    Transforms.delete(editor, { at: blockPath });
  }
};

/**
 * @returns `true` if the path is in the last line of a code block
 * @returns `false` if the path is in another line of a code block
 * @throws if the path is not inside a code block
 */
export const isInLastLineOfCodeBlock = (
  editor: TEditor,
  path: Path
): boolean => {
  const codeBlock = getAbove<CodeBlockElement>(editor, {
    at: path,
    match: (node) => node.type === ELEMENT_CODE_BLOCK,
  });
  if (!codeBlock) {
    console.error('Path is not in a code block', path);
    throw new Error('Path is not in a code block');
  }

  const [codeBlockNode, codeBlockPath] = codeBlock;
  return path[codeBlockPath.length] === codeBlockNode.children.length - 1;
};
