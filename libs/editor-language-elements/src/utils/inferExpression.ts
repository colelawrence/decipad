import { parseOneBlock, isExpression } from '@decipad/computer';
import { CoercibleType } from '../types';

export const inferExpression = (text: string): CoercibleType | undefined => {
  const block = parseOneBlock(text);
  if (block.args.length === 1 && isExpression(block.args[0])) {
    return { type: { kind: 'anything' }, coerced: text };
  }
  return undefined;
};
