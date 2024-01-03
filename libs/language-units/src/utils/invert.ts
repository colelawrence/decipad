import DeciNumber, { ONE } from '@decipad/number';

export function invert(
  f: (n: DeciNumber) => DeciNumber
): (n: DeciNumber) => DeciNumber {
  const reversingFactor = f(ONE).inverse();
  return (n) => n.mul(reversingFactor);
}
