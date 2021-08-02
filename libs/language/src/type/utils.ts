import { AST } from '..';
import { Type } from '.';
import { produce } from 'immer';

export const setUnit = (t: Type, newUnit: AST.Unit[] | null) =>
  produce(t, t => {
    if (t.type === 'number') {
      t.unit = newUnit;
    }
  });
