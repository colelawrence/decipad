import { MyEditor, MyValue } from '@decipad/editor-types';
import {
  EElement,
  TNodeEntry,
  insertText,
  isElement,
  isText,
  removeNodes,
  withoutNormalizing,
} from '@udecode/plate';
import stringify from 'json-stringify-safe';

export const replaceText = (
  editor: MyEditor,
  entry: TNodeEntry<EElement<MyValue>>,
  text: string
): void => {
  withoutNormalizing(editor, () => {
    let inserted = false;
    const [node, path] = entry;
    if (!isElement(node)) {
      throw new Error(`Expected node to be element and is ${stringify(node)}`);
    }
    node.children.forEach((child, childIndex) => {
      if (!isText(child)) {
        throw new Error(`child is not text: ${stringify(child)}`);
      }
      const childPath = [...path, childIndex];
      if (!inserted) {
        insertText(editor, text, { at: childPath });
        inserted = true;
      } else {
        removeNodes(editor, { at: childPath });
      }
    });
  });
};
