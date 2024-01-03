import DeciNumber from '@decipad/number';
import { getInstanceof } from '@decipad/utils';

export const coherceToFraction = (value: unknown): DeciNumber => {
  return getInstanceof(value, DeciNumber, 'value is not a number');
};
