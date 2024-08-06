import type { MyEditor, MyElement } from '@decipad/editor-types';
import { toDOMNode } from '@udecode/plate-common';

export const getNodeRect = (editor: MyEditor, node: MyElement) => {
  const domNode = toDOMNode(editor, node);
  if (!domNode) return null;

  const insideDOMNode = domNode.querySelector('[data-draggable-inside]');
  if (!insideDOMNode) return null;

  const { left, right, top, bottom } = insideDOMNode.getBoundingClientRect();

  return {
    xStart: left,
    xEnd: right,
    yStart: top,
    yEnd: bottom,
  };
};
