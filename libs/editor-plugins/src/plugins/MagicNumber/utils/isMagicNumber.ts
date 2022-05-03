import { MARK_MAGICNUMBER } from '@decipad/editor-types';
import { Text } from 'slate';

export type MagicNumber = Text & {
  [MARK_MAGICNUMBER]: true;
};

export const isMagicNumber = (child: Text): child is MagicNumber => {
  return (child as MagicNumber)[MARK_MAGICNUMBER] === true;
};
