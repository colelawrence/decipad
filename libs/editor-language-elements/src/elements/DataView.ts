import { Computer } from '@decipad/computer';
import { MyElement, MyEditor, ELEMENT_DATA_VIEW } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { InteractiveLanguageElement } from '../types';

export const DataView: InteractiveLanguageElement = {
  type: ELEMENT_DATA_VIEW,
  resultsInExpression: true,
  getExpressionFromElement: async (
    _editor: MyEditor,
    _computer: Computer,
    element: MyElement
  ) => {
    assertElementType(element, ELEMENT_DATA_VIEW);

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
