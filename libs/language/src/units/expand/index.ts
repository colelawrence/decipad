import DeciNumber from '@decipad/number';
import { Unit } from '../..';

export type Converter = (n: DeciNumber) => DeciNumber;
export type ExpandUnitResult = [Unit[], Converter];
export type ExpandUnitResultWithNullableUnits = [
  Unit[] | undefined | null,
  Converter
];

export * from './expand-units';
export * from './contract-units';
