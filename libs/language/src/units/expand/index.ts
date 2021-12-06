import Fraction from 'fraction.js';
import { AST } from '../../parser';

export type Converter = (n: Fraction) => Fraction;
export type ExpandUnitResult = [AST.Unit[], Converter];

export * from './expand-units';
export * from './contract-units';
