import type { FromJSArg } from '../Value';
import { UnknownValue, fromJS, getColumnLike } from '../Value';
import type { DimensionId, HypercubeArg } from './types';
import type { ContextUtils } from '../ContextUtils';
import { identity } from '@decipad/utils';

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
  callBuiltinFunctor: async () => {
    throw new Error('Not implemented');
  },
  callBuiltin: async () => {
    throw new Error('Not implemented');
  },
  callFunctor: async () => {
    throw new Error('Not implemented');
  },
  callValue: async () => {
    throw new Error('Not implemented');
  },
  retrieveHumanVariableNameByGlobalVariableName: identity,
});
