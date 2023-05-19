import stringify from 'json-stringify-safe';

export const jsonify = <T>(o: T): T | undefined => {
  try {
    return JSON.parse(stringify(o));
  } catch (err) {
    return undefined;
  }
};
