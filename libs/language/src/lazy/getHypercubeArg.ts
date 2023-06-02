import { typeToDimensionIds } from '../dimtools/common';
import { Context } from '../infer';
import type { HypercubeArg, HypercubeArgLoose } from './LazyOperation';

export const getHypercubeArg =
  (ctx: Context) =>
  ([value, dimsOrType]: HypercubeArgLoose): HypercubeArg => {
    const dims = Array.isArray(dimsOrType)
      ? dimsOrType
      : typeToDimensionIds(ctx, dimsOrType);
    return [value, dims];
  };
