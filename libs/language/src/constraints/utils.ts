import Fraction from 'fraction.js/bigfraction';
import { isInfinity } from './Infinity';
import { LogicNumber } from './types';

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
  return isInfinity(o) || o instanceof Fraction;
};
