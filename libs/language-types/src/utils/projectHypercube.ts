import { empty } from '@decipad/generator-utils';
import type { PromiseOrType } from '@decipad/utils';
import { materializeOneResult } from './materializeOneResult';
import type { Dimension } from '../Dimension';
import type { MinimalTensor } from '../Value/MinimalTensor';
import type { OneResult } from '../Result';
import { isLowLevelMinimalTensor } from './isLowLevelMinimalTensor';
import { getDimensionLength } from './getDimensionLength';

const recurseProjection = async (
  dims: Dimension[],
  currentDepth: number,
  _currentCoordinates: number[],
  hc: MinimalTensor
): Promise<OneResult> => {
  if (dims.length > 0) {
    const [firstDim, ...restDims] = dims;
    return async function* materializeGen(
      start = 0,
      _end = Infinity
    ): AsyncGenerator<OneResult> {
      const dimLength = await getDimensionLength(firstDim.dimensionLength);
      const end = Math.min(dimLength, _end);
      for (let i = start; i < end; i++) {
        const currentCoordinates = [..._currentCoordinates];
        currentCoordinates[currentDepth] = i;
        yield recurseProjection(
          restDims,
          currentDepth + 1,
          currentCoordinates,
          hc
        );
      }
    };
  } else {
    return materializeOneResult(
      isLowLevelMinimalTensor(hc)
        ? hc.lowLowLevelGet(..._currentCoordinates)
        : (await hc.lowLevelGet(..._currentCoordinates)).getData()
    );
  }
};

export const EMPTY: OneResult = () => empty();

/**
 * Come up with all possible .lowLevelGet arg combinations and call
 * it while building a nested array
 * */
export const projectHypercube = async (
  _hc: PromiseOrType<MinimalTensor>
): Promise<OneResult> => {
  const hc = await _hc;
  const dimensions = await hc.dimensions();
  if (dimensions.some((dim) => dim.dimensionLength === 0)) {
    return EMPTY;
  }

  // args for lowLevelGet(). We'll be mutating this as we go
  const currentCoordinates = dimensions.map(() => 0);
  return recurseProjection(dimensions, 0, currentCoordinates, hc);
};
