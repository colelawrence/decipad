import type { MyNode, MyEditor } from '@decipad/editor-types';
import { ELEMENT_COLUMNS } from '@decipad/editor-types';
import { toDOMNode, getParentNode, isElement } from '@udecode/plate-common';
import { columnGap, blockGap } from './constants';
import type { Path } from 'slate';

export const getNodeDropLinePositions = (
  editor: MyEditor,
  node: MyNode,
  path: Path
): null | {
  top: number;
  bottom: number;
  left: number;
  right: number;
} => {
  const nodeIsColumns = isElement(node) && node.type === ELEMENT_COLUMNS;

  const domNode = toDOMNode(editor, node);
  if (!domNode) return null;

  const { top, bottom, left, right } = domNode.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(domNode);

  const parentNode: MyNode | undefined = getParentNode(editor, path)?.[0];
  const parentIsColumns = parentNode?.type === ELEMENT_COLUMNS;

  /**
   * If the parent is a columns element, use the bottom of the columns element
   * to ensure that all columns' drop lines end at the same point.
   */
  const columnsBottom: number = (() => {
    if (!parentIsColumns) return 0;
    const parentDomNode = toDOMNode(editor, parentNode);
    if (!parentDomNode) return 0;
    return parentDomNode.getBoundingClientRect().bottom;
  })();

  /**
   * For most elements, vertical spacing is achieved through padding-top on the
   * element DOM node. Columns elements work differently; their spacing comes
   * from the padding-top on their children.
   */
  const paddingTop = nodeIsColumns
    ? (() => {
        const firstChildNode = node.children[0];
        const firstChildDOMNode = toDOMNode(editor, firstChildNode);
        if (!firstChildDOMNode) return 0;
        const firstChildComputedStyles =
          window.getComputedStyle(firstChildDOMNode);
        return parseFloat(firstChildComputedStyles.paddingTop);
      })()
    : parseFloat(computedStyle.paddingTop);

  return {
    top: top + paddingTop / 2,
    bottom: (parentIsColumns ? columnsBottom : bottom) + blockGap / 2,
    left: left - parseFloat(computedStyle.marginLeft) - columnGap / 2,
    right: right + columnGap / 2,
  };
};
