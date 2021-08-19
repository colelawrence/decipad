import { fail } from 'assert';

export default function getDefined<T>(
  d: T | undefined | null,
  message = 'Not defined'
): T {
  if (d === undefined || d === null) {
    fail(message);
  }
  return d;
}
