export type ResultScalar = number | boolean | string;
export type ResultColumn = OneResult[];

export type OneResult = ResultScalar | ResultColumn;
export type Result = OneResult[];
