import type { PromiseOrType } from '@decipad/utils';
import type { Type } from '../Type/Type';
import type { Value } from '@decipad/language-interfaces';

export type DimensionId = string | number;

export type OperationFunction = (
  values: Value.Value[]
) => PromiseOrType<Value.Value>;

export type HypercubeArg = [arg: Value.Value, argDimensionIds: DimensionId[]];
export type HypercubeArgLoose = [
  arg: Value.Value,
  dimensionLike: DimensionId[] | Type
];
