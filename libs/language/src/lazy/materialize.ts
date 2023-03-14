import { OneResult } from '../interpreter/interpreter-types';
import type { Dimension, MinimalTensor } from './types';

/**
 * Come up with all possible .lowLevelGet arg combinations and call
 * it while building a nested array
 * */
export function materialize(hc: MinimalTensor): OneResult {
  if (hc.dimensions.some((dim) => dim.dimensionLength === 0)) {
    return [];
  }

  /** args for lowLevelGet(). We'll be mutating this as we go */
  const currentCoordinates = hc.dimensions.map(() => 0);

  return (function recurse(dims: Dimension[], currentDepth: number): OneResult {
    if (dims.length > 0) {
      const [firstDim, ...restDims] = dims;
      return Array.from({ length: firstDim.dimensionLength }, (_, i) => {
        currentCoordinates[currentDepth] = i;
        return recurse(restDims, currentDepth + 1);
      });
    } else {
      return hc.lowLevelGet(...currentCoordinates).getData();
    }
  })(hc.dimensions, 0);
}
