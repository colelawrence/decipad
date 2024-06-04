import type { Computer } from '@decipad/computer-interfaces';
import { parseExpressionOrThrow } from '@decipad/remote-computer';
import type { CoercibleType } from './types';

export const inferExpression = async (
  computer: Computer,
  text: string
): Promise<CoercibleType | undefined> => {
  try {
    const parsed = parseExpressionOrThrow(text, false, true);
    const type = await computer.expressionType(parsed);
    if (parsed.type !== 'noop') {
      return { type, coerced: text };
    }
  } catch {
    // Parse error
  }
  return undefined;
};
