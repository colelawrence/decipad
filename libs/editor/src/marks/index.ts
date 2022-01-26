// eslint-disable-next-line import/no-self-import
import * as markKinds from '.';

/* eslint-disable no-restricted-imports */
export {
  MARK_BOLD,
  MARK_UNDERLINE,
  MARK_STRIKETHROUGH,
  MARK_ITALIC,
  MARK_CODE,
} from '@udecode/plate';
/* eslint-enable no-restricted-imports */

export type MarkKind = typeof markKinds[keyof typeof markKinds];
