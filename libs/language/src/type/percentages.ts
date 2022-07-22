import { produce } from 'immer';
import type { AST } from '..';
import type { Type } from '.';

export const onlyOneIsPercentage = (
  me: AST.NumberFormat | null,
  other: AST.NumberFormat | null
) => {
  if (me === 'percentage' && other === 'percentage') {
    return false;
  }
  if (me === 'percentage' || other === 'percentage') {
    return true;
  }
  return false;
};

export const propagatePercentage = (me: Type, other: Type) => {
  if (onlyOneIsPercentage(me.numberFormat, other.numberFormat)) {
    return produce(me, (m) => {
      m.numberFormat = null;
    });
  }
  return me;
};
