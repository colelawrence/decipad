import type { Value } from '@decipad/language-interfaces';

export const isLowLevelMinimalTensor = (
  value: unknown
): value is Value.LowLevelMinimalTensor =>
  value != null &&
  typeof value === 'object' &&
  typeof (value as Value.LowLevelMinimalTensor).lowLowLevelGet === 'function';
