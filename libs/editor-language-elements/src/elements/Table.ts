import {
  MyElement,
  ELEMENT_TABLE,
  TableElement,
  MyEditor,
} from '@decipad/editor-types';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { getTableAstNodeFromTableElement } from '../utils/getTableAstNodeFromTableElement';

export const Table: InteractiveLanguageElement = {
  type: ELEMENT_TABLE,
  resultsInNameAndExpression: true,
  getNameAndExpressionFromElement: weakMapMemoizeInteractiveElementOutput(
    (editor: MyEditor, _element: MyElement) => {
      const element = _element as TableElement;
      return [getTableAstNodeFromTableElement(editor, element)];
    }
  ),
};
