import { getNodeString, isText } from '@udecode/plate';
import {
  CodeLineElement,
  CodeLineV2ElementCode,
  ELEMENT_SMART_REF,
  TableColumnFormulaElement,
} from '@decipad/editor-types';
import { getExprRef } from '@decipad/computer';
import { isElementOfType } from './isElementOfType';

export const getCodeLineSource = (
  node: CodeLineElement | TableColumnFormulaElement | CodeLineV2ElementCode
) => {
  const childCount = node.children.length;
  const res = node.children
    .map((c, i) => {
      if (isElementOfType(c, ELEMENT_SMART_REF)) {
        const needsWhitespaceBefore =
          i >= 1 &&
          (!isText(node.children[i - 1]) ||
            !getNodeString(node.children[i - 1]).endsWith(' '));
        const needsWhitespaceAfter =
          i < childCount - 1 &&
          (!isText(node.children[i + 1]) ||
            !getNodeString(node.children[i + 1]).startsWith(' '));

        const bspc = needsWhitespaceBefore ? ' ' : '';
        const aspc = needsWhitespaceAfter ? ' ' : '';
        return (
          bspc +
          getExprRef(c.blockId) +
          (c.columnId ? `.${getExprRef(c.columnId)}` : '') +
          aspc
        );
      }
      return getNodeString(c);
    })
    .join('');
  return res;
};
