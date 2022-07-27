import { ELEMENT_CODE_LINE, MyWithOverride } from '@decipad/editor-types';
import {
  getEditorString,
  getPointBefore,
  getRange,
  isCollapsed,
  moveSelection,
  someNode,
} from '@udecode/plate';

export const withCodeLine: MyWithOverride = (editor) => {
  const { insertText } = editor;

  // eslint-disable-next-line no-param-reassign
  editor.insertText = (text) => {
    if (
      text === '\n' &&
      editor.selection &&
      isCollapsed(editor.selection) &&
      someNode(editor, {
        match: { type: ELEMENT_CODE_LINE },
      })
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

  return editor;
};
