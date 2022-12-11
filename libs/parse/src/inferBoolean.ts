import { CoercibleType } from './types';

export const coerceToBoolean = (text: string): string => {
  switch (text.toLowerCase().trim()) {
    case 'true':
    case 'yes':
      return 'true';
    default:
      return 'false';
  }
};

export const parseBoolean = (text: string): boolean => {
  switch (text.toLowerCase()) {
    case 'true':
    case 'yes':
      return true;
  }
  return false;
};

export const inferBoolean = (text: string): CoercibleType | undefined => {
  switch (text.toLowerCase()) {
    case 'true':
    case 'false':
      return { type: { kind: 'boolean' }, coerced: coerceToBoolean(text) };
  }
  return undefined;
};
