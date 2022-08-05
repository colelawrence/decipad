import { ELEMENT_PARAGRAPH, MARK_MAGICNUMBER } from '@decipad/editor-types';
import { assertElementType, magicNumberId } from '@decipad/editor-utils';
import { getNodeString } from '@udecode/plate';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';
import { InteractiveLanguageElement } from '../types';

export const Paragraph: InteractiveLanguageElement = {
  type: ELEMENT_PARAGRAPH,
  isStructural: true,
  getUnparsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    (_editor, element) => {
      assertElementType(element, ELEMENT_PARAGRAPH);

      return element.children.flatMap((child, index) => {
        if (MARK_MAGICNUMBER in child) {
          return {
            type: 'unparsed-block',
            id: magicNumberId(element, index),
            source: getNodeString(child),
          };
        }
        return [];
      });
    }
  ),
};
