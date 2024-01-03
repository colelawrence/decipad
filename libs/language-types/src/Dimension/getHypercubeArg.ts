import type { HypercubeArg, HypercubeArgLoose } from './LazyOperation';
import { typeToDimensionIds } from './typeToDimensionId';
import type { ContextUtils } from '../ContextUtils';

export const getHypercubeArg =
  (utils: ContextUtils) =>
  ([value, dimsOrType]: HypercubeArgLoose): HypercubeArg => {
    const dims = Array.isArray(dimsOrType)
      ? dimsOrType
      : typeToDimensionIds(utils, dimsOrType);
    return [value, dims];
  };
