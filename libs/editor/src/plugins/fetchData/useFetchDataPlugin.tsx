import {
  getPlatePluginTypes,
  getRenderElement,
  PlatePlugin,
} from '@udecode/plate';
import { ELEMENT_FETCH } from '../../elements';

export const useFetchDataPlugin = (): PlatePlugin => {
  return {
    renderElement: getRenderElement(ELEMENT_FETCH),
    voidTypes: getPlatePluginTypes(ELEMENT_FETCH),
  };
};
