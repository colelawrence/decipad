import stringify from 'json-stringify-safe';

export function clone<T>(o: T): T {
  return JSON.parse(stringify(o));
}
