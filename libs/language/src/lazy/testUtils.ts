import { fromJS, FromJSArg, getColumnLike } from '../value';
import { HypercubeArg } from './Hypercube';
import { DimensionId } from './types';

export const jsCol = (items: FromJSArg) => getColumnLike(fromJS(items));

export const hcArg = (
  col: FromJSArg,
  dimensionId: DimensionId
): HypercubeArg => {
  return [fromJS(col), [dimensionId]];
};
