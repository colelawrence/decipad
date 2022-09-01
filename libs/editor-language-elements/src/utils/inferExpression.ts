import { parseOneExpression } from '@decipad/computer';
import { CoercibleType } from '../types';

export const inferExpression = (text: string): CoercibleType | undefined => {
  try {
    const parsed = parseOneExpression(text);
    if (parsed.type !== 'noop') {
      return {
        type: { kind: 'anything' },
        coerced: text,
      };
    }
  } catch {
    // Parse error
  }
  return undefined;
};
