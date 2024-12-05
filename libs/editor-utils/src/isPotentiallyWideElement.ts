import type { MyValue } from '@decipad/editor-types';
import {
  ELEMENT_DATA_VIEW,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_TIME_SERIES,
} from '@decipad/editor-types';
import { ELEMENT_TABLE } from '@udecode/plate-table';

const potentiallyWideElementTypes = new Set([
  ELEMENT_TABLE,
  ELEMENT_DATA_VIEW,
  ELEMENT_TIME_SERIES,
  ELEMENT_LIVE_CONNECTION,
]);

export const isPotentiallyWideElement = (el: MyValue[number]) =>
  potentiallyWideElementTypes.has(el.type);
