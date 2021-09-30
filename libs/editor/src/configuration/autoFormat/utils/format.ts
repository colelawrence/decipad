import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  getParent,
  isElement,
  isType,
  SPEditor,
  TEditor,
} from '@udecode/plate';

export const format = (editor: TEditor, customFormatting: () => void): void => {
  if (editor.selection) {
    const parentEntry = getParent(editor, editor.selection);
    if (!parentEntry) return;
    const [node] = parentEntry;
    if (
      isElement(node) &&
      !isType(editor as SPEditor, node, ELEMENT_CODE_BLOCK) &&
      !isType(editor as SPEditor, node, ELEMENT_CODE_LINE)
    ) {
      customFormatting();
    }
  }
};
