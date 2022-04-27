import { Element, ELEMENT_TABLE, TableElement } from '@decipad/editor-types';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { getTableAstNodeFromTableElement } from '../utils/getTableAstNodeFromTableElement';

export const Table: InteractiveLanguageElement = {
  type: ELEMENT_TABLE,
  resultsInNameAndExpression: true,
  getNameAndExpressionFromElement: weakMapMemoizeInteractiveElementOutput(
    (_element: Element) => {
      const element = _element as TableElement;
      return getTableAstNodeFromTableElement(element);
    }
  ),
};
