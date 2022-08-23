import {
  MyElement,
  ELEMENT_TABLE,
  TableElement,
  MyEditor,
} from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { getTableAstNodeFromTableElement } from '../utils/getTableAstNodeFromTableElement';

export const Table: InteractiveLanguageElement = {
  type: ELEMENT_TABLE,
  resultsInNameAndExpression: true,
  getNameAndExpressionFromElement: weakMapMemoizeInteractiveElementOutput(
    async (editor: MyEditor, computer: Computer, _element: MyElement) => {
      const element = _element as TableElement;
      return [await getTableAstNodeFromTableElement(editor, computer, element)];
    }
  ),
};
