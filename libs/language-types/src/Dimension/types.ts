import type { PromiseOrType } from '@decipad/utils';
import type { Value } from '../Value/Value';
import type { Type } from '../Type/Type';

export type DimensionId = string | number;

export type OperationFunction = (values: Value[]) => PromiseOrType<Value>;

export type HypercubeArg = [arg: Value, argDimensionIds: DimensionId[]];
export type HypercubeArgLoose = [
  arg: Value,
  dimensionLike: DimensionId[] | Type
];
