import Fraction from '@decipad/fraction';
import { Unit } from '../..';

export type Converter = (n: Fraction) => Fraction;
export type ExpandUnitResult = [Unit[], Converter];

export * from './expand-units';
export * from './contract-units';
