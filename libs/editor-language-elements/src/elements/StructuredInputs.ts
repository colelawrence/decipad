import { Program, SerializedType } from '@decipad/computer';
import { ELEMENT_STRUCTURED_IN } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { parseCell } from '@decipad/parse';
import { InteractiveLanguageElement } from '../types';
import { parseElementAsVariableAssignment } from '../utils/parseElementAsVariableAssignment';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

/**
 * Parsing the structured input elements into the language, these elements are
 * slightly special because they ONLY accept numbers, and allow the user to select units.
 * 1) We either take units as strings, or unit objects, and parse them like this.
 * 2) Declare them with their name
 *
 * Edge case: Percentages, these are NOT units, but we display them as such.
 * So we have to check if we want a %, and build the SerializedType from this.
 */
export const StructuredInput: InteractiveLanguageElement = {
  type: ELEMENT_STRUCTURED_IN,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    async (_editor, computer, e): Promise<Program> => {
      assertElementType(e, ELEMENT_STRUCTURED_IN);

      const typeHint: SerializedType =
        e.unit === '%'
          ? {
              kind: 'number',
              unit: null,
              numberFormat: 'percentage',
            }
          : {
              kind: 'number',
              unit:
                typeof e.unit === 'string'
                  ? await computer.getUnitFromText(e.unit ?? '')
                  : e.unit ?? null,
            };
      const parsedInput = await parseCell(
        computer,
        typeHint,
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
