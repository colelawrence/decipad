import { H2Element, H3Element, MyEditor, MyValue } from '@decipad/editor-types';
import {
  ELEMENT_H2,
  ELEMENT_H3,
  findNode,
  getParentNode,
} from '@udecode/plate';
import { NodeEntry } from 'slate';

const searchNodeTypes = new Set([ELEMENT_H2, ELEMENT_H3]);

export const findParent = (
  editor: MyEditor,
  entry: NodeEntry<MyValue[number]>
): NodeEntry<H2Element | H3Element> | undefined => {
  const [node, path] = entry;
  if (path.length > 1) {
    const parent = getParentNode(editor, path);
    if (parent) {
      return findParent(editor, parent as NodeEntry<MyValue[number]>);
    }
  }
  // root element
  if (searchNodeTypes.has(node.type)) {
    return entry as NodeEntry<H2Element | H3Element>;
  }
  const before = path[path.length - 1] - 1;
  if (before >= 0) {
    const searchAbove = [...path.slice(0, -1), before];
    const above = findNode(editor, { at: searchAbove, block: true });
    if (above) {
      return findParent(editor, above as NodeEntry<MyValue[number]>);
    }
  }
  return undefined;
};
