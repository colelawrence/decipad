import { getRenderElement, PlatePlugin } from '@udecode/plate';
import { ELEMENT_LINK } from '../../elements';

export const createLinkPlugin = (): PlatePlugin => {
  return {
    renderElement: getRenderElement([ELEMENT_LINK]),
    inlineTypes: () => [ELEMENT_LINK],
  };
};
