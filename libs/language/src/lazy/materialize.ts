import { empty, from } from '@decipad/generator-utils';
import { PromiseOrType } from '@decipad/utils';
import type { Dimension, MinimalTensor } from './types';
import { OneResult } from '../result';
import { materializeOneResult } from '../utils/materializeOneResult';

const recurse = async (
  dims: Dimension[],
  currentDepth: number,
  _currentCoordinates: number[],
  hc: MinimalTensor
): Promise<OneResult> => {
  const currentCoordinates = [..._currentCoordinates];
  if (dims.length > 0) {
    const [firstDim, ...restDims] = dims;
    return materializeOneResult(() =>
      from(
        Promise.all(
          Array.from({ length: firstDim.dimensionLength }, async (_, i) => {
            currentCoordinates[currentDepth] = i;
            return recurse(restDims, currentDepth + 1, currentCoordinates, hc);
          })
        )
      )
    );
  } else {
    return materializeOneResult(
      (await hc.lowLevelGet(...currentCoordinates)).getData()
    );
  }
};

export const EMPTY: OneResult = () => empty();

/**
 * Come up with all possible .lowLevelGet arg combinations and call
 * it while building a nested array
 * */
export const materialize = async (
  _hc: PromiseOrType<MinimalTensor>
): Promise<OneResult> => {
  const hc = await _hc;
  const dimensions = await hc.dimensions();
  if (dimensions.some((dim) => dim.dimensionLength === 0)) {
    return EMPTY;
  }

  /** args for lowLevelGet(). We'll be mutating this as we go */
  const currentCoordinates = dimensions.map(() => 0);
  return recurse(dimensions, 0, currentCoordinates, hc);
};
