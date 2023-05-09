import DeciNumber from '@decipad/number';
import { getInstanceof } from '.';

export const coherceToFraction = (value: unknown): DeciNumber => {
  return getInstanceof(value, DeciNumber);
};
