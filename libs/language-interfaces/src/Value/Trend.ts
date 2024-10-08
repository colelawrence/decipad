import DeciNumber from '@decipad/number';
import { Value } from './Value';

export interface TrendValue extends Value {
  first: DeciNumber | undefined;
  last: DeciNumber | undefined;
  diff: DeciNumber | undefined;
}

export const isTrendValue = (value: unknown): value is TrendValue =>
  value != null &&
  typeof value === 'object' &&
  Object.hasOwn(value, 'first') &&
  Object.hasOwn(value, 'last') &&
  Object.hasOwn(value, 'diff');
