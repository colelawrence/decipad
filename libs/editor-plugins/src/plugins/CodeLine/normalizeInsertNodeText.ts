import { MyEditor } from '@decipad/editor-types';
import { isElement, isText, TDescendant } from '@udecode/plate';

export const normalizeInsertNodeText = (
  editor: MyEditor,
  node: TDescendant
) => {
  if (isElement(node)) {
    node.children.forEach((child) => {
      normalizeInsertNodeText(editor, child);
    });
  }

  if (isText(node) && node.text.includes('\u00a0')) {
    // eslint-disable-next-line no-param-reassign
    node.text = node.text.replaceAll('\u00a0', ' ');
  }
};
