import { produce } from 'immer';
import { AST } from '..';
import { Type } from '.';

export const setUnit = (t: Type, newUnit: AST.Unit[] | null) =>
  produce(t, (t) => {
    if (t.type === 'number') {
      t.unit = newUnit;
    }
  });
