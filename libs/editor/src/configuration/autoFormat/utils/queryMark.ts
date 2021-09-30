import {
  ELEMENT_PARAGRAPH,
  getParent,
  isElement,
  TEditor,
} from '@udecode/plate';

export const queryMark = (editor: TEditor): boolean => {
  if (editor.selection) {
    const parentEntry = getParent(editor, editor.selection);
    if (!parentEntry) return false;

    const [node] = parentEntry;

    if (isElement(node) && node.type === ELEMENT_PARAGRAPH) return true;
    return false;
  }
  return true;
};
