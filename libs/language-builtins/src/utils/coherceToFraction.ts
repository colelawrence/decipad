import type { DeciNumberBase } from '@decipad/number';
import DeciNumber from '@decipad/number';
import { getInstanceof } from '@decipad/utils';

export const coherceToFraction = (value: unknown): DeciNumberBase => {
  return getInstanceof(value, DeciNumber, 'value is not a number');
};
