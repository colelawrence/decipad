import { getRenderElement, PlatePlugin } from '@udecode/plate';
import { ELEMENT_PLOT } from '@decipad/editor-types';

export const createPlotPlugin = (): PlatePlugin => {
  return {
    renderElement: getRenderElement([ELEMENT_PLOT]),
    voidTypes: () => [ELEMENT_PLOT],
  };
};
