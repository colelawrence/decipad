import type { HypercubeArg, HypercubeArgLoose } from './types';
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
