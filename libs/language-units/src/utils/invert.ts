import type DeciNumber from '@decipad/number';
import { ONE } from '@decipad/number';

export function invert(
  f: (n: DeciNumber) => DeciNumber
): (n: DeciNumber) => DeciNumber {
  const reversingFactor = f(ONE).inverse();
  return (n) => n.mul(reversingFactor);
}
