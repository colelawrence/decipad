import { parseOneBlock } from '@decipad/computer';
import { CoercibleType } from '../types';

export const inferNumber = (text: string): CoercibleType | undefined => {
  try {
    parseOneBlock(text);

    return {
      type: {
        kind: 'number',
        unit: null,
      },
      coerced: text,
    };
  } catch (err) {
    // do nothing
  }

  return undefined;
};
