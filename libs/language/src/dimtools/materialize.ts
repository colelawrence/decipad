import { produce } from 'immer';
import { Column, Value } from '../interpreter/Value';
import { getDefined } from '../utils';
import type {
  Dimension,
  DimensionId,
  Hypercube,
  HypercubeLike,
} from './hypercube';
import { uniqDimensions } from './multidimensional-utils';

export function getAt(
  hc: HypercubeLike,
  coordinates: Map<string | number, number>
) {
  const uniqueDimensions = uniqDimensions(hc.dimensions);
  if (coordinates.size !== uniqueDimensions.length) {
    throw new Error(
      `panic: not enough keys: given ${[
        ...coordinates.keys(),
      ]} and wanted ${uniqueDimensions.map((d) => d.dimensionId)}`
    );
  }

  const linearArgs = hc.dimensions.map((dimVal) =>
    getDefined(coordinates.get(dimVal.dimensionId))
  );

  return hc.lowLevelGet(...linearArgs);
}

export function materializeToValue(hc: HypercubeLike): Value {
  return (function recurse(
    dims: Dimension[],
    coordinates: Map<DimensionId, number>
  ): Value {
    if (dims.length > 0) {
      const [firstDim, ...restDims] = dims;
      return Column.fromValues(
        Array.from({ length: firstDim.dimensionLength }, (_, i) => {
          const innerCoords = produce(coordinates, (cursor) => {
            cursor.set(firstDim.dimensionId, i);
          });
          return recurse(restDims, innerCoords);
        })
      );
    } else {
      return getAt(hc, coordinates);
    }
  })(uniqDimensions(hc.dimensions), new Map());
}

export function materializeWhenNonDimensional(hc: Hypercube): Value {
  if (hc.dimensions.length) {
    return hc;
  }
  return materializeToValue(hc);
}

export function materialize(hc: HypercubeLike) {
  return materializeToValue(hc).getData();
}
