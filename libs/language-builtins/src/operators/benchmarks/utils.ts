// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';

export const getNums = (n: number, scalar = 10) =>
  Value.fromJS(
    Array(n)
      .fill(0)
      .map(() => Math.random() * scalar)
  );
