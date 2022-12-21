import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2_CODE,
  MyWithOverride,
} from '@decipad/editor-types';
import {
  getEditorString,
  getPointBefore,
  getRange,
  isCollapsed,
  isVoid,
  moveSelection,
  someNode,
} from '@udecode/plate';
import { normalizeInsertNodeText } from './normalizeInsertNodeText';
import { applyCodeLineSelection } from './applyCodeLineSelection';

export const withCodeLine: MyWithOverride = (editor) => {
  const { insertText, apply } = editor;

  // eslint-disable-next-line no-param-reassign
  editor.insertText = (text) => {
    if (
      text === '\n' &&
      editor.selection &&
      isCollapsed(editor.selection) &&
      (someNode(editor, {
        match: { type: ELEMENT_CODE_LINE },
      }) ||
        someNode(editor, {
          match: { type: ELEMENT_CODE_LINE_V2_CODE },
        }))
    ) {
      const previousChar = getEditorString(
        editor,
        getRange(
          editor,
          editor.selection,
          getPointBefore(editor, editor.selection)
        )
      );

      if (previousChar === '{') {
        insertText('\n  \n');
        moveSelection(editor, { reverse: true });

        return;
      }
    }

    insertText(text);
  };

  // eslint-disable-next-line no-param-reassign
  editor.apply = (op) => {
    if (op.type === 'insert_node' && !isVoid(editor, op.node)) {
      normalizeInsertNodeText(editor, op.node);
    }

    applyCodeLineSelection(editor, op);

    apply(op);
  };

  return editor;
};
