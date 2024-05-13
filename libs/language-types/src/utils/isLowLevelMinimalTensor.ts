import type { LowLevelMinimalTensor } from '../Value/LowLevelMinimalTensor';

export const isLowLevelMinimalTensor = (
  value: unknown
): value is LowLevelMinimalTensor =>
  value != null &&
  typeof value === 'object' &&
  typeof (value as LowLevelMinimalTensor).lowLowLevelGet === 'function';
