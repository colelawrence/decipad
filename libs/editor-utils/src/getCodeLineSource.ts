import { getNodeString } from '@udecode/plate';
import {
  CodeLineElement,
  ELEMENT_SMART_REF,
  TableColumnFormulaElement,
} from '@decipad/editor-types';
import { getExprRef } from '@decipad/computer';
import { isElementOfType } from './isElementOfType';

export const getCodeLineSource = (
  node: CodeLineElement | TableColumnFormulaElement
) =>
  node.children
    .map((c) =>
      isElementOfType(c, ELEMENT_SMART_REF)
        ? getExprRef(c.blockId)
        : getNodeString(c)
    )
    .join('');
