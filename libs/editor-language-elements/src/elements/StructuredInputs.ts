import { Program } from '@decipad/computer';
import { ELEMENT_STRUCTURED_IN } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { parseCell } from '@decipad/parse';
import { InteractiveLanguageElement } from '../types';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

export const StructuredInput: InteractiveLanguageElement = {
  type: ELEMENT_STRUCTURED_IN,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    async (_editor, computer, e): Promise<Program> => {
      assertElementType(e, ELEMENT_STRUCTURED_IN);
      const parsedInput = await parseCell(
        computer,
        {
          kind: 'number',
          unit:
            typeof e.unit === 'string'
              ? await computer.getUnitFromText(e.unit ?? '')
              : e.unit ?? null,
        },
        e.children[1].children[0].text
      );

      return parseElementAsVariableAssignment(
        e.id,
        e.children[0].children[0].text,
        parsedInput instanceof Error || parsedInput === null ? '' : parsedInput
      );
    }
  ),
};
