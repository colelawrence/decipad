import {
  BracketCounter,
  doSeparateStatement,
  tokenize,
} from '@decipad/language';
import { AnyObject, TEditor, TNode } from '@udecode/plate';
import { Node, NodeEntry } from 'slate';

export const filterStatementSeparator =
  (editor: TEditor<AnyObject>) =>
  (entry: NodeEntry<TNode>): boolean => {
    const anchor = editor.selection?.anchor?.offset ?? 0;
    const focus = editor.selection?.focus?.offset ?? 0;
    const cursorStart = anchor < focus ? anchor : focus;
    const cursorEnd = anchor > focus ? anchor : focus;

    if (cursorStart == null || cursorEnd == null) {
      return false;
    }

    const openCounter = new BracketCounter();
    const nText = Node.string(entry[0]);

    // This function runs "onKeyPress", before the newline has been added to
    // the text, so it needs to be added at the cursor position for the sake of
    // calculating statement separation.
    const text = `${nText.slice(0, cursorStart)}\n${nText.slice(cursorEnd)}`;

    const statementSep = tokenize(text).some((tok, index, tokens) => {
      openCounter.feed(tok);
      const sep = doSeparateStatement({
        tok,
        nextTok: tokens[index + 1],
        prevTok: tokens[index - 1],
        openCounter,
      });
      return sep;
    });

    return !statementSep;
  };
