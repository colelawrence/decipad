import { normalizeColumnName } from './normalizeColumnName';

export const sanitizeRawResult = (o: unknown): unknown => {
  if (Array.isArray(o)) {
    return o.map(sanitizeRawResult);
  }
  if (o != null && typeof o === 'object') {
    return Object.fromEntries(
      Object.entries(o).map(([key, value]) => [
        normalizeColumnName(key),
        sanitizeRawResult(value),
      ])
    );
  }
  return o;
};
