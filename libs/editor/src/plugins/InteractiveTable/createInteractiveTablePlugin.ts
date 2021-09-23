import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  getRenderElement,
  PlatePlugin,
} from '@udecode/plate';
import {
  ELEMENT_TABLE_CAPTION,
  ELEMENT_THEAD,
  ELEMENT_TBODY,
  ELEMENT_HEAD_TR,
} from '../../utils/elementTypes';

export const createInteractiveTablePlugin = (): PlatePlugin => {
  return {
    renderElement: getRenderElement([
      ELEMENT_TABLE,
      ELEMENT_TABLE_CAPTION,
      ELEMENT_THEAD,
      ELEMENT_HEAD_TR,
      ELEMENT_TBODY,
      ELEMENT_TR,
      ELEMENT_TH,
      ELEMENT_TD,
    ]),
  };
};
