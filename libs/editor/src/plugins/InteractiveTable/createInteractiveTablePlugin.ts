import { getRenderElement, PlatePlugin } from '@udecode/plate';
import { ELEMENT_TABLE_INPUT } from '../../utils/elementTypes';

export const createInteractiveTablePlugin = (): PlatePlugin => {
  return {
    renderElement: getRenderElement([ELEMENT_TABLE_INPUT]),
  };
};
