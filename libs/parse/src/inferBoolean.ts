import { CoercibleType } from './types';

const coerceToBoolean = (text: string): string => {
  switch (text.toLowerCase().trim()) {
    case 'true':
    case 'yes':
      return 'true';
    default:
      return 'false';
  }
};

export const inferBoolean = (text: string): CoercibleType | undefined => {
  switch (text.toLowerCase()) {
    case 'true':
    case 'false':
    case 'yes':
    case 'no':
      return { type: { kind: 'boolean' }, coerced: coerceToBoolean(text) };
  }
  return undefined;
};
