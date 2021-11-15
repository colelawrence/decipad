import Fraction from 'fraction.js';

export type ResultScalar = number | boolean | string | Fraction;
export type ResultColumn = OneResult[];

export type OneResult = ResultScalar | ResultColumn;
export type Result = OneResult[];
