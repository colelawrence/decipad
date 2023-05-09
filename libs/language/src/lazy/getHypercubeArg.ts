import { typeToDimensionIds } from '../dimtools/common';
import type { HypercubeArg, HypercubeArgLoose } from './LazyOperation';

export const getHypercubeArg = ([
  value,
  dimsOrType,
]: HypercubeArgLoose): HypercubeArg => {
  const dims = Array.isArray(dimsOrType)
    ? dimsOrType
    : typeToDimensionIds(dimsOrType);
  return [value, dims];
};
