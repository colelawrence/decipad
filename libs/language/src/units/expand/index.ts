import DeciNumber from '@decipad/number';
import { Unit } from '../..';

export type Converter = (n: DeciNumber) => DeciNumber;
export type ExpandUnitResult = [Unit[], Converter];

export * from './expand-units';
export * from './contract-units';
