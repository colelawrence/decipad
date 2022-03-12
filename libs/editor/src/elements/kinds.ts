// eslint-disable-next-line import/no-self-import
import * as elementKinds from './kinds';

/* eslint-disable no-restricted-imports */
export {
  // Headings
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  // Text blocks
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
  // Code
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  // Lists
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_LI,
  ELEMENT_LIC,
  // Inline
  ELEMENT_LINK,
} from '@udecode/plate';
/* eslint-enable no-restricted-imports */

export const ELEMENT_FETCH = 'fetch-data';

export const ELEMENT_TABLE_INPUT = 'table-input';

export const ELEMENT_INPUT = 'input';

export type ElementKind = typeof elementKinds[keyof typeof elementKinds];
