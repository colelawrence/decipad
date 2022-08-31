import {
  MyElement,
  InputElement,
  ELEMENT_INPUT,
  MyEditor,
} from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { parseElementVariableAssignment } from '../utils/parseElementVariableAssignment';

export const Input: InteractiveLanguageElement = {
  type: ELEMENT_INPUT,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    async (_editor: MyEditor, _computer: Computer, element: MyElement) => {
      const { variableName, value, id } = element as InputElement;
      if (!variableName) {
        return [];
      }

      return [parseElementVariableAssignment(id, variableName, value)];
    }
  ),
};
