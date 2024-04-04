import stringify from 'json-stringify-safe';
import type { CoercibleType } from './types';

const coerceToString = (text: string): string => {
  return stringify(text);
};

export const inferText = (text: string): CoercibleType => {
  return {
    type: {
      kind: 'string',
    },
    coerced: coerceToString(text),
  };
};
