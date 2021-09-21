import {
  getPlatePluginTypes,
  getRenderElement,
  PlatePlugin,
} from '@udecode/plate';
import { ELEMENT_IMPORT_DATA } from '../../utils/elementTypes';

export const useImportDataPlugin = (): PlatePlugin => {
  return {
    renderElement: getRenderElement(ELEMENT_IMPORT_DATA),
    voidTypes: getPlatePluginTypes(ELEMENT_IMPORT_DATA),
  };
};
