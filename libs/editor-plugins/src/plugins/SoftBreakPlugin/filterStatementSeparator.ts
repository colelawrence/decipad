import { STATEMENT_SEP_TOKEN_TYPE, tokenize } from '@decipad/computer';
import { getNodeString } from '@udecode/plate';
import { MyEditor, MyNodeEntry } from '@decipad/editor-types';

export const filterStatementSeparator =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): boolean => {
    const anchor = editor.selection?.anchor?.offset ?? 0;
    const focus = editor.selection?.focus?.offset ?? 0;
    const cursorStart = anchor < focus ? anchor : focus;
    const cursorEnd = anchor > focus ? anchor : focus;

    if (cursorStart == null || cursorEnd == null) {
      return false;
    }

    const nText = getNodeString(entry[0]);

    // This function runs "onKeyPress", before the newline has been added to
    // the text, so it needs to be added at the cursor position for the sake of
    // calculating statement separation.
    const text = `${nText.slice(0, cursorStart)}\n`;

    const statementSep = tokenize(text).some(
      (tok) => tok.type === STATEMENT_SEP_TOKEN_TYPE
    );
    return !statementSep;
  };
