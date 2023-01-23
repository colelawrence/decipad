import { Program } from '@decipad/computer';
import { ELEMENT_STRUCTURED_IN } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { InteractiveLanguageElement } from '../types';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

export const StructuredInput: InteractiveLanguageElement = {
  type: ELEMENT_STRUCTURED_IN,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    async (_editor, _computer, e): Promise<Program> => {
      assertElementType(e, ELEMENT_STRUCTURED_IN);
      return parseElementAsVariableAssignment(
        e.id,
        e.children[0].children[0].text,
        `${e.children[1].children[0].text} ${e.unit ?? ''}`
      );
    }
  ),
};
