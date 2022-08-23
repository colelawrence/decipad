import { Computer } from '@decipad/computer';
import {
  MyElement,
  ELEMENT_PLOT,
  PlotElement,
  MyEditor,
} from '@decipad/editor-types';
import { InteractiveLanguageElement } from '../types';

const astNode = <T extends string, A extends unknown[]>(
  type: T,
  ...args: A
) => ({ type, args });

export const Plot: InteractiveLanguageElement = {
  type: ELEMENT_PLOT,
  resultsInExpression: true,
  getExpressionFromElement: async (
    _editor: MyEditor,
    _computer: Computer,
    element: MyElement
  ) => {
    const { sourceVarName } = element as PlotElement;
    if (!sourceVarName) {
      return [];
    }
    return [{ id: element.id, expression: astNode('ref', sourceVarName) }];
  },
};
