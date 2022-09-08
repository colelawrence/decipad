import { Computer, parseOneExpression } from '@decipad/computer';
import { CoercibleType } from './types';

export const inferExpression = async (
  computer: Computer,
  text: string
): Promise<CoercibleType | undefined> => {
  try {
    const parsed = parseOneExpression(text);
    const type = await computer.expressionType(parsed);
    if (parsed.type !== 'noop') {
      return {
        type,
        coerced: text,
      };
    }
  } catch {
    // Parse error
  }
  return undefined;
};
