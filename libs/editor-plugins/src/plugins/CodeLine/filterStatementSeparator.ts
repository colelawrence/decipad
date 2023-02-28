import {
  Computer,
  STATEMENT_SEP_TOKEN_TYPE,
  tokenize,
} from '@decipad/computer';
import { getDefined } from '@decipad/utils';
import {
  getBlockAbove,
  getChildren,
  getNodeString,
  isElement,
} from '@udecode/plate';
import {
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_CODE_LINE,
  ELEMENT_SMART_REF,
  MyEditor,
} from '@decipad/editor-types';
import { Path } from 'slate';

export const filterStatementSeparator = (
  editor: MyEditor,
  computer: Computer
): boolean => {
  const anchor = editor.selection?.anchor?.offset ?? 0;
  const focus = editor.selection?.focus?.offset ?? 0;
  let cursorStart = anchor < focus ? anchor : focus;
  const cursorEnd = anchor > focus ? anchor : focus;

  if (cursorStart == null || cursorEnd == null) {
    return false;
  }

  const codeLineEntry = getDefined(
    getBlockAbove(editor, {
      match: (n) =>
        isElement(n) &&
        (n.type === ELEMENT_CODE_LINE || n.type === ELEMENT_CODE_LINE_V2_CODE),
    })
  );

  // if there are smart refs in this code line we need to get text from all code line children, and adjust the cursortStart
  const children = getChildren(codeLineEntry);

  const nText = children.reduce(
    (acc, [n]) =>
      isElement(n) && n.type === ELEMENT_SMART_REF
        ? acc + (computer.getSymbolDefinedInBlock(n.blockId) || '')
        : acc + getNodeString(n),
    ''
  );

  cursorStart =
    children
      .filter(([_, path]) => Path.isBefore(path, editor.selection!.anchor.path))
      .reduce(
        (acc, [n]) =>
          isElement(n) && n.type === ELEMENT_SMART_REF
            ? acc + (computer.getSymbolDefinedInBlock(n.blockId) || '').length
            : acc + getNodeString(n).length,
        0
      ) + cursorStart;

  // This function runs "onKeyPress", before the newline has been added to
  // the text, so it needs to be added at the cursor position for the sake of
  // calculating statement separation.
  const text = `${nText.slice(0, cursorStart)}\n`;

  const statementSep = tokenize(text).some(
    (tok) => tok.type === STATEMENT_SEP_TOKEN_TYPE
  );
  return !statementSep;
};
