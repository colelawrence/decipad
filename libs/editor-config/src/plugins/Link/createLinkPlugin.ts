import { ELEMENT_LINK } from '@decipad/editor-types';
import { getRenderElement, PlatePlugin } from '@udecode/plate';

export const createLinkPlugin = (): PlatePlugin => {
  return {
    renderElement: getRenderElement([ELEMENT_LINK]),
    inlineTypes: () => [ELEMENT_LINK],
  };
};
