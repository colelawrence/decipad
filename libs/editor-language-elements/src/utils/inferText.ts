import { CoercibleType } from '../types';

const coerceToString = (text: string): string => {
  return JSON.stringify(text);
};

export const inferText = (text: string): CoercibleType => {
  return {
    type: {
      kind: 'string',
    },
    coerced: coerceToString(text),
  };
};
