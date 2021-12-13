import Fraction from '@decipad/fraction';

export type ResultScalar = bigint | boolean | string | Fraction | symbol;
export type ResultColumn = OneResult[];

export type OneResult = ResultScalar | ResultColumn;
export type Result = OneResult[];
