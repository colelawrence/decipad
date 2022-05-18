import {
  CodeBlockElement,
  CodeLineElement,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  MyEditor,
} from '@decipad/editor-types';
import {
  deleteText,
  getAboveNode,
  getEditorString,
  insertNodes,
} from '@udecode/plate';
import { Path } from 'slate';
import {
  requireBlockParentPath,
  requirePathBelowBlock,
} from '@decipad/editor-utils';

const codeLineElement = {
  type: ELEMENT_CODE_LINE,
  children: [{ text: '' }],
} as CodeLineElement;

export const insertCodeLineBelow = (
  editor: MyEditor,
  path: Path,
  select = false
): void => {
  insertNodes<CodeLineElement>(editor, codeLineElement, {
    at: requirePathBelowBlock(editor, path),
    select,
  });
};

export const insertCodeLineBelowOrReplace = (
  editor: MyEditor,
  path: Path,
  select = false
): void => {
  const blockPath = requireBlockParentPath(editor, path);
  const isBlockEmpty = !getEditorString(editor, blockPath);

  insertCodeLineBelow(editor, blockPath, select);
  if (isBlockEmpty) {
    deleteText(editor, { at: blockPath });
  }
};

/**
 * @returns `true` if the path is in the last line of a code block
 * @returns `false` if the path is in another line of a code block
 * @throws if the path is not inside a code block
 */
export const isInLastLineOfCodeBlock = (
  editor: MyEditor,
  path: Path
): boolean => {
  const codeBlock = getAboveNode<CodeBlockElement>(editor, {
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
