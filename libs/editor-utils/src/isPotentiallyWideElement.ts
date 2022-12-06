import {
  ELEMENT_DATA_VIEW,
  ELEMENT_LIVE_CONNECTION,
  MyValue,
} from '@decipad/editor-types';
import { ELEMENT_TABLE } from '@udecode/plate';

const potentiallyWideElementTypes = new Set([
  ELEMENT_TABLE,
  ELEMENT_DATA_VIEW,
  ELEMENT_LIVE_CONNECTION,
]);

export const isPotentiallyWideElement = (el: MyValue[number]) =>
  potentiallyWideElementTypes.has(el.type);
