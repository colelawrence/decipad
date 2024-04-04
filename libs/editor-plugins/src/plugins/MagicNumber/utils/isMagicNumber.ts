import { MARK_MAGICNUMBER } from '@decipad/editor-types';
import type { TText } from '@udecode/plate-common';

export type MagicNumber = TText & {
  [MARK_MAGICNUMBER]: true;
};

export const isMagicNumber = (child: TText): child is MagicNumber => {
  return !!child[MARK_MAGICNUMBER];
};
