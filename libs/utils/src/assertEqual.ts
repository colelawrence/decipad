import { diff } from 'jest-diff';
import { dequal } from './deepequal';

export const assertEqual = (a: unknown, b: unknown) => {
  if (!dequal(a, b)) {
    const d = diff(a, b);
    throw new Error(d ?? 'Unknown diff error');
  }
};
