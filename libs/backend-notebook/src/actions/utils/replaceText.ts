import { AnyElement, MyEditor, MyValue } from '@decipad/editor-types';
import {
  EElement,
  TNodeEntry,
  hasNode,
  insertText,
  isElement,
} from '@udecode/plate';
import stringify from 'json-stringify-safe';

export const replaceText = (
  editor: MyEditor,
  entry: TNodeEntry<EElement<MyValue> | AnyElement>,
  text: string
): void => {
  const [node, path] = entry;
  if (!isElement(node)) {
    throw new Error(`Expected node to be element and is ${stringify(node)}`);
  }
  const firstTextPath = [...path, 0];
  if (hasNode(editor, firstTextPath)) {
    insertText(editor, text, { at: firstTextPath });
  } else {
    insertText(editor, text, { at: path });
  }
};
