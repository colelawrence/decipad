import stringify from 'json-stringify-safe';

export const cleanString = (str: string): string => {
  return JSON.parse(stringify(str));
};
