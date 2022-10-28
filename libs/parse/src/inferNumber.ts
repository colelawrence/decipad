import { Computer, parseExpressionOrThrow } from '@decipad/computer';
import { CoercibleType } from './types';

interface InferNumberOptions {
  doNotTryExpressionNumbersParse?: boolean;
}

const inferPlainNumber = (text: string): CoercibleType | undefined => {
  const n = Number(text);
  if (Number.isNaN(n)) {
    return undefined;
  }
  return {
    type: { kind: 'number', unit: null },
    coerced: text,
  };
};

export const inferNumber = async (
  computer: Computer,
  text: string,
  options: InferNumberOptions = {}
): Promise<CoercibleType | undefined> => {
  if (options.doNotTryExpressionNumbersParse) {
    return inferPlainNumber(text);
  }
  try {
    const exp = parseExpressionOrThrow(text);
    const type = await computer.expressionType(exp);
    if ((await type).kind === 'number') {
      return {
        type,
        coerced: text,
      };
    }
  } catch (err) {
    // do nothing
  }

  return undefined;
};
