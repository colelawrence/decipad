import { Computer } from '@decipad/computer';
import { MyElement, MyEditor, ELEMENT_DATA_VIEW } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';

export const DataView: InteractiveLanguageElement = {
  type: ELEMENT_DATA_VIEW,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    async (_editor: MyEditor, _computer: Computer, element: MyElement) => {
      assertElementType(element, ELEMENT_DATA_VIEW);

      if (!element.varName) {
        return [];
      }

      return parseElementAsVariableAssignment(element.id, element.varName, {
        type: 'ref',
        args: [element.varName],
      });
    }
  ),
};
