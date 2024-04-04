import DeciNumber from '@decipad/number';
import { isInfinity } from './Infinity';
import type { LogicNumber } from './types';

interface WithType {
  type: string;
}

export const hasType = (obj: unknown, type: string): boolean => {
  return (
    typeof obj === 'object' &&
    typeof (obj as WithType).type !== 'undefined' &&
    (obj as WithType).type === type
  );
};

export const isLogicNumber = (o: unknown): o is LogicNumber => {
  return isInfinity(o) || o instanceof DeciNumber;
};
