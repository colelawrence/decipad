import type { DeciNumberBase } from '@decipad/number';
import { ONE } from '@decipad/number';

export function invert(
  f: (n: DeciNumberBase) => DeciNumberBase
): (n: DeciNumberBase) => DeciNumberBase {
  const reversingFactor = f(ONE).inverse();
  return (n) => n.mul(reversingFactor);
}
