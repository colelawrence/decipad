import {
  RemoteComputer,
  parseExpressionOrThrow,
} from '@decipad/remote-computer';
import { containsNumber } from '@decipad/utils';
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
  computer: RemoteComputer,
  text: string,
  options: InferNumberOptions = {}
): Promise<CoercibleType | undefined> => {
  if (options.doNotTryExpressionNumbersParse) {
    return inferPlainNumber(text);
  }
  if (containsNumber(text)) {
    try {
      const exp = parseExpressionOrThrow(text);
      const type = await computer.expressionType(exp);
      if (type.kind === 'number') {
        return { type, coerced: text };
      }
    } catch (err) {
      // do nothing
    }
  }

  return undefined;
};
