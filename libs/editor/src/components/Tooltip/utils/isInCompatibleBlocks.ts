import {
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  getNode,
  SPEditor,
} from '@udecode/plate';
import { Path } from 'slate';

export const isInCompatibleBlocks = (editor: SPEditor): boolean => {
  const whitelist = [ELEMENT_PARAGRAPH, ELEMENT_H2, ELEMENT_H3, 'lic'];
  if (editor.selection) {
    const node = getNode(editor, Path.parent(editor.selection.anchor.path));

    if (node) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return whitelist.includes((node as any).type);
    }

    return false;
  }
  return false;
};
