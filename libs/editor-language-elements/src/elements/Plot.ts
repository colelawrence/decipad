import { Element, ELEMENT_PLOT, PlotElement } from '@decipad/editor-types';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

const astNode = <T extends string, A extends unknown[]>(
  type: T,
  ...args: A
) => ({ type, args });

export const Plot: InteractiveLanguageElement = {
  type: ELEMENT_PLOT,
  resultsInNameAndExpression: true,
  getNameAndExpressionFromElement: weakMapMemoizeInteractiveElementOutput(
    (element: Element) => {
      const { sourceVarName } = element as PlotElement;
      if (!sourceVarName) {
        return null;
      }
      return {
        name: sourceVarName,
        expression: astNode('ref', sourceVarName),
      };
    }
  ),
};
