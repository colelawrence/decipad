import {
  DeprecatedCodeBlockElement,
  CodeLineElement,
  ELEMENT_CODE_LINE,
  MyEditor,
} from '@decipad/editor-types';
import { insertNodes } from '@decipad/editor-utils';
import { getNode, insertText, mergeNodes } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Path } from 'slate';
import { getCodeBlockOffsets, reinstateCursorOffsets } from './offsets';
import { getCodeLineText, incrementLastElementOfPath } from './utils';
import { NormalizerReturnValue } from '../../pluginFactories';

function reconcileCodeLineByMergingWithNext(
  editor: MyEditor,
  line: CodeLineElement,
  codeLinePath: Path
): NormalizerReturnValue {
  const nextCodeLinePath = incrementLastElementOfPath(codeLinePath);
  const next = getNode<CodeLineElement>(editor, nextCodeLinePath);
  if (next) {
    const currentCodeLine = getCodeLineText(line);
    // merge the 2 code_line nodes: the one at next_path with the current one
    insertText(editor, `${currentCodeLine}\n`, {
      at: [...codeLinePath],
    });

    return () =>
      mergeNodes(editor, {
        at: nextCodeLinePath,
      });
  }
  return false;
}

function reconcileByMergingWithNext(
  editor: MyEditor,
  codeLinePath: Path,
  expectedStatement: string
): NormalizerReturnValue {
  const line = getNode<CodeLineElement>(editor, codeLinePath);
  if (!line) {
    return false;
  }
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
): NormalizerReturnValue {
  const expectedStatement = _expectedStatement;
  // insert one new code line after current one with the rest of the statement
  let nextLineText = childText.slice(expectedStatement.length);
  if (nextLineText.startsWith('\n')) {
    nextLineText = nextLineText.substring(1);
  }
  const newNode: CodeLineElement = {
    id: nanoid(),
    type: ELEMENT_CODE_LINE,
    children: [
      {
        text: nextLineText,
      },
    ],
  };
  return () => {
    insertNodes(editor, [newNode], {
      at: incrementLastElementOfPath(codeLinePath),
    });
    insertText(editor, expectedStatement, {
      at: [...codeLinePath, 0],
    });
  };
}

function reconcileLine(
  editor: MyEditor,
  line: CodeLineElement,
  expectedStatement: string,
  codeLinePath: Path
): NormalizerReturnValue {
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
): NormalizerReturnValue {
  let childIndex = -1;
  let statementIndex = -1;
  const codeBlock = getNode<DeprecatedCodeBlockElement>(editor, codeBlockPath);
  if (!codeBlock) {
    return false;
  }
  const offsets = getCodeBlockOffsets(editor, codeBlockPath);
  for (const line of codeBlock.children) {
    childIndex += 1;
    statementIndex += 1;
    const expectedText = statements[statementIndex] || '';
    if (needsReconciliation(line, expectedText)) {
      const normalize = reconcileLine(editor, line, expectedText, [
        ...codeBlockPath,
        childIndex,
      ]);
      if (normalize) {
        return () => {
          normalize();
          reinstateCursorOffsets(editor, codeBlockPath, offsets);
        };
      }
    }
  }
  return false;
}
