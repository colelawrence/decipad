import DeciNumber from '@decipad/number';
import { getInstanceof } from '@decipad/utils';

export const coerceToFraction = (value: unknown): DeciNumber =>
  getInstanceof(value, DeciNumber);
