/* eslint-disable no-param-reassign */
import type { MyGenericEditor, MyValue } from '@decipad/editor-types';
import { ELEMENT_TD } from '@decipad/editor-types';
import { setCellText } from '../utils';
import type { Value } from '@udecode/plate-common';
import { getAboveNode, getNodeString } from '@udecode/plate-common';

/**
 * Not related to the withInsertTextTable exported from Plate. Ensures that
 * pasted plain text values are correctly inserted into the modal table cell.
 *
 * The editor method called when pasting text varies depending on the data
 * types of the pasted content. If the clipboard contains only text/plain, then
 * the pasting is handled by insertTextData. If the clipboard contains HTML or
 * a Slate fragment, then insertFragment is called instead.
 *
 * The default insertTextData handler splits the text into lines and calls
 * insertText for each one. Overriding insertText instead of insertTextData
 * would not work, since each line would replace the one before it.
 */
export const withInsertTextTable = <
  TV extends Value = MyValue,
  TE extends MyGenericEditor<TV> = MyGenericEditor<TV>
>(
  editor: TE
) => {
  const { insertTextData, insertFragment } = editor;

  const handleInsertText = (text: string): boolean => {
    const { selection } = editor;
    if (!selection) return false;

    const cellEntry = getAboveNode(editor, {
      at: selection.anchor.path,
      match: { type: ELEMENT_TD },
    });
    if (!cellEntry) return false;

    const [, path] = cellEntry;
    setCellText<TV>(editor, path, text);
    return true;
  };

  editor.insertTextData = (data) => {
    const text = data.getData('text/plain');
    if (handleInsertText(text)) return true;
    return insertTextData(data);
  };

  editor.insertFragment = (fragment) => {
    const text = fragment.map(getNodeString).join('');
    if (handleInsertText(text)) return;
    insertFragment(fragment);
  };

  return editor;
};
