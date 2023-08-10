import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  MARK_MAGICNUMBER,
} from '@decipad/editor-types';
import { magicNumberId } from '@decipad/editor-utils';
import { getNodeString } from '@udecode/plate';
import { InteractiveLanguageElement } from '../types';
import { parseElementAsSourceCode } from '../utils/parseElementAsSourceCode';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

export const Paragraph: InteractiveLanguageElement = {
  type: [
    ELEMENT_PARAGRAPH,
    ELEMENT_CALLOUT,
    ELEMENT_LI,
    ELEMENT_OL,
    ELEMENT_LIC,
    ELEMENT_UL,
    ELEMENT_H2,
    ELEMENT_H3,
    ELEMENT_BLOCKQUOTE,
  ],
  isStructural: true,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    (_editor, _computer, element) => {
      return element.children.flatMap((child, index) => {
        if (MARK_MAGICNUMBER in child) {
          return parseElementAsSourceCode(
            magicNumberId(element, index),
            getNodeString(child),
            'expression',
            true,
            element.id
          );
        }
        return [];
      });
    }
  ),
};
