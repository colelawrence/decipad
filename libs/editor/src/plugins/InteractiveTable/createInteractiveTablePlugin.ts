import { getRenderElement, PlatePlugin } from '@udecode/plate';
import { TABLE_INPUT } from '../../utils/elementTypes';

export const createInteractiveTablePlugin = (): PlatePlugin => {
  return {
    renderElement: getRenderElement([TABLE_INPUT]),
  };
};
