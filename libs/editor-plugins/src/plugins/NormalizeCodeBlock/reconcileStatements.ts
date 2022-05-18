import {
  CodeBlockElement,
  CodeLineElement,
  ELEMENT_CODE_LINE,
  MyEditor,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { getNode, insertNodes, insertText, mergeNodes } from '@udecode/plate';
import { Path } from 'slate';
import { getCodeBlockOffsets, reinstateCursorOffsets } from './offsets';
import { getCodeLineText, incrementLastElementOfPath } from './utils';

function reconcileCodeLineByMergingWithNext(
  editor: MyEditor,
  line: CodeLineElement,
  codeLinePath: Path
): boolean {
  const nextCodeLinePath = incrementLastElementOfPath(codeLinePath);
  const next = getNode<CodeLineElement>(editor, nextCodeLinePath);
  if (next) {
    const currentCodeLine = getCodeLineText(line);
    // merge the 2 code_line nodes: the one at next_path with the current one
    insertText(editor, `${currentCodeLine}\n`, {
      at: [...codeLinePath],
    });

    mergeNodes(editor, {
      at: nextCodeLinePath,
    });
    return true;
  }
  return false;
}

function reconcileByMergingWithNext(
  editor: MyEditor,
  codeLinePath: Path,
  expectedStatement: string
): boolean {
  const line = getDefined(getNode<CodeLineElement>(editor, codeLinePath));
  const lineText = getCodeLineText(line);
  if (lineText.length < expectedStatement.length) {
    return reconcileCodeLineByMergingWithNext(editor, line, codeLinePath);
  }
  return false;
}

function reconcileBySplitting(
  editor: MyEditor,
  _expectedStatement: string,
  childText: string,
  codeLinePath: Path
): boolean {
  const expectedStatement = _expectedStatement;
  // insert one new code line after current one with the rest of the statement
  let nextLineText = childText.slice(expectedStatement.length);
  if (nextLineText.startsWith('\n')) {
    nextLineText = nextLineText.substring(1);
  }
  const newNode: Omit<CodeLineElement, 'id'> = {
    type: ELEMENT_CODE_LINE,
    children: [
      {
        text: nextLineText,
      },
    ],
  };
  insertNodes(editor, newNode as CodeLineElement, {
    at: incrementLastElementOfPath(codeLinePath),
  });
  insertText(editor, expectedStatement, {
    at: [...codeLinePath, 0],
  });
  return true;
}

function reconcileLine(
  editor: MyEditor,
  line: CodeLineElement,
  expectedStatement: string,
  codeLinePath: Path
): boolean {
  const text = getCodeLineText(line);
  if (text.length > expectedStatement.length) {
    return reconcileBySplitting(editor, expectedStatement, text, codeLinePath);
  }
  return reconcileByMergingWithNext(editor, codeLinePath, expectedStatement);
}

function needsReconciliation(
  line: CodeLineElement,
  expectedStatement: string
): boolean {
  const text = getCodeLineText(line);
  return text !== expectedStatement;
}

export function reconcileStatements(
  editor: MyEditor,
  statements: string[],
  codeBlockPath: Path
): boolean {
  let childIndex = -1;
  let statementIndex = -1;
  const codeBlock = getNode<CodeBlockElement>(editor, codeBlockPath);
  if (!codeBlock) {
    return false;
  }
  const offsets = getCodeBlockOffsets(editor, codeBlockPath);
  for (const line of codeBlock.children) {
    childIndex += 1;
    statementIndex += 1;
    const expectedText = statements[statementIndex] || '';
    if (needsReconciliation(line, expectedText)) {
      const changed = reconcileLine(editor, line, expectedText, [
        ...codeBlockPath,
        childIndex,
      ]);
      if (changed) {
        reinstateCursorOffsets(editor, codeBlockPath, offsets);
        return true;
      }
    }
  }
  return false;
}
