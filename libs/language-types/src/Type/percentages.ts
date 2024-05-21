import { produce } from '@decipad/utils';
import type { AST } from '@decipad/language-interfaces';
import type { Type } from './Type';

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
