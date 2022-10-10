import { MyEditor, MyNodeEntry } from '@decipad/editor-types';
import {
  deleteText,
  getChildren,
  getNode,
  getNodeString,
  insertText,
  isText,
  withoutNormalizing,
} from '@udecode/plate';
import diff from 'fast-diff';
import { Path, Point } from 'slate';

const getPoint = (entry: MyNodeEntry, offset: number): Point | undefined => {
  let currentOffset = 0;
  for (const child of getChildren(entry)) {
    const [node, path] = child;
    if (!isText(node)) {
      throw new Error('direct children should be text only nodes');
    }
    if (currentOffset + node.text.length >= offset) {
      const textNodeOffset = offset - currentOffset;
      return { path, offset: textNodeOffset };
    }
    currentOffset += node.text.length;
  }
  return undefined;
};

export const mutateText = (editor: MyEditor, path: Path) => {
  const converge = (newText: string): void => {
    const element = getNode(editor, path);
    if (!element) {
      return;
    }
    withoutNormalizing(editor, () => {
      const text = getNodeString(element);
      const d = diff(text, newText);
      let offset = 0;
      for (const difference of d) {
        switch (difference[0]) {
          case diff.EQUAL: {
            offset += difference[1].length;
            break;
          }
          case diff.DELETE: {
            deleteText(editor, {
              at: getPoint([element, path], offset),
              distance: difference[1].length,
            });
            return converge(newText);
          }
          case diff.INSERT: {
            insertText(editor, difference[1], {
              at: getPoint([element, path], offset),
            });
            return converge(newText);
          }
        }
      }
    });
  };

  return converge;
};
