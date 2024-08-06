import {
  ELEMENT_DRAW,
  ELEMENT_HR,
  ELEMENT_INTEGRATION,
  ELEMENT_LAYOUT,
  ELEMENT_TABLE,
} from './element-kinds';

export const UNCOLUMNABLE_KINDS = [
  ELEMENT_LAYOUT,
  ELEMENT_TABLE,
  ELEMENT_INTEGRATION,
  // Dividers lack drag handles, so can't be easily removed from layouts
  ELEMENT_HR,
  // Draw elements need more width than slim layouts can give them
  ELEMENT_DRAW,
] as const;
