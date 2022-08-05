import {
  MyElement,
  MyEditor,
  ELEMENT_POWER_TABLE,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { InteractiveLanguageElement } from '../types';

export const PowerTable: InteractiveLanguageElement = {
  type: ELEMENT_POWER_TABLE,
  resultsInExpression: true,
  getExpressionFromElement: (_editor: MyEditor, element: MyElement) => {
    assertElementType(element, ELEMENT_POWER_TABLE);

    if (!element.varName) {
      return [];
    }

    return [
      {
        id: element.id,
        expression: { type: 'ref', args: [element.varName] },
      },
    ];
  },
};
