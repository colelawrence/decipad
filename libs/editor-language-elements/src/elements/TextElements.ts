import {
  ELEMENT_CALLOUT,
  ELEMENT_PARAGRAPH,
  MARK_MAGICNUMBER,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_LIC,
  ELEMENT_UL,
} from '@decipad/editor-types';
import { magicNumberId } from '@decipad/editor-utils';
import { getNodeString } from '@udecode/plate';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { InteractiveLanguageElement } from '../types';
import { parseElementSourceCode } from '../utils/parseElementSourceCode';

export const Paragraph: InteractiveLanguageElement = {
  type: [
    ELEMENT_PARAGRAPH,
    ELEMENT_CALLOUT,
    ELEMENT_LI,
    ELEMENT_OL,
    ELEMENT_LIC,
    ELEMENT_UL,
  ],
  isStructural: true,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    async (_editor, _computer, element) => {
      return element.children.flatMap((child, index) => {
        if (MARK_MAGICNUMBER in child) {
          return parseElementSourceCode(
            magicNumberId(element, index),
            getNodeString(child),
            'expression'
          );
        }
        return [];
      });
    }
  ),
};
