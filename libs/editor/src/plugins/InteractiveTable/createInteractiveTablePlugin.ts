import { getRenderElement, PlatePlugin } from '@udecode/plate';
import { ELEMENT_TABLE_INPUT } from '@decipad/editor-types';

export const createInteractiveTablePlugin = (): PlatePlugin => {
  return {
    renderElement: getRenderElement([ELEMENT_TABLE_INPUT]),
    voidTypes: () => [ELEMENT_TABLE_INPUT],
  };
};
