import type { Unit } from '@decipad/language-interfaces';
import type { DeciNumberBase } from '@decipad/number';

export type Converter = (n: DeciNumberBase) => DeciNumberBase;
export type ExpandUnitResult = [Unit[], Converter];
export type ExpandUnitResultWithNullableUnits = [
  Unit[] | undefined | null,
  Converter
];

export * from './expand-units';
export * from './contract-units';
