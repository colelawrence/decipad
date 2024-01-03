import { FromJSArg, UnknownValue, fromJS, getColumnLike } from '../Value';
import { HypercubeArg } from './LazyOperation';
import { DimensionId } from './types';
import type { ContextUtils } from '../ContextUtils';

export const jsCol = (items: FromJSArg) => getColumnLike(fromJS(items));

export const hcArg = (
  col: FromJSArg,
  dimensionId: DimensionId
): HypercubeArg => [fromJS(col), [dimensionId]];

export const makeContext = (): ContextUtils => ({
  retrieveIndexByName: () => null,
  retrieveVariableTypeByGlobalVariableName: () => null,
  retrieveVariableValueByGlobalVariableName: () => UnknownValue,
  simpleExpressionEvaluate: async () => Promise.resolve(UnknownValue),
});
