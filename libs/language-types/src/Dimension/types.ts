import type { PromiseOrType } from '@decipad/utils';
import type { Value } from '../Value/Value';

export type DimensionId = string | number;

export type OperationFunction = (values: Value[]) => PromiseOrType<Value>;
