import { Computer, parseExpressionOrThrow } from '@decipad/computer';
import { CoercibleType } from './types';

export const inferExpression = (
  computer: Computer,
  text: string
): CoercibleType | undefined => {
  try {
    const parsed = parseExpressionOrThrow(text, false, true);
    const type = computer.expressionType(parsed);
    if (parsed.type !== 'noop') {
      return { type, coerced: text };
    }
  } catch {
    // Parse error
  }
  return undefined;
};
