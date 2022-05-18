import { MARK_MAGICNUMBER } from '@decipad/editor-types';
import { TText } from '@udecode/plate';

export type MagicNumber = TText & {
  [MARK_MAGICNUMBER]: true;
};

export const isMagicNumber = (child: TText): child is MagicNumber => {
  return !!child[MARK_MAGICNUMBER];
};
