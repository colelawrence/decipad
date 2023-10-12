import type { RemoteComputer, SerializedType } from '@decipad/remote-computer';
import { containsNumber } from '@decipad/utils';
import { CoercibleType } from './types';
import { inferBoolean } from './inferBoolean';
import { inferDate } from './inferDate';
import { inferExpression } from './inferExpression';
import { inferText } from './inferText';
import { inferNumber } from './inferNumber';

const inferParseError = (
  text: string,
  kind?: SerializedType['kind']
): CoercibleType => ({
  type: {
    kind: 'type-error',
    errorCause: {
      errType: 'free-form',
      message: kind
        ? `Cannot parse ${kind} out of "${text}"`
        : `Cannot parse "${text}"`,
    },
  },
  coerced: text,
});

interface InferTypeOptions {
  type?: SerializedType;
  doNotTryExpressionNumbersParse?: boolean;
}

const tryInferChain = async (
  computer: RemoteComputer,
  text: string,
  options: InferTypeOptions
): Promise<CoercibleType> => {
  let inferResult = inferDate(text, 'month') ??
    inferDate(text, 'day') ??
    inferBoolean(text) ??
    (await inferNumber(computer, text, options)) ??
    inferDate(text) ??
    (options.doNotTryExpressionNumbersParse
      ? undefined
      : await inferExpression(computer, text)) ?? {
      type: { kind: 'string' },
      coerced: text,
    };

  if (inferResult.type.kind === 'number' && !containsNumber(text)) {
    inferResult = {
      type: { kind: 'string' },
      coerced: text,
    };
  }
  return inferResult;
};

export const inferType = async (
  computer: RemoteComputer,
  _text: string,
  options: InferTypeOptions = {}
): Promise<CoercibleType> => {
  const text = _text.trim();

  const { type } = options;

  switch (type?.kind) {
    case 'boolean':
      return inferBoolean(text) ?? inferParseError(text, type.kind);
    case 'date':
      return inferDate(text) ?? inferParseError(text, type.kind);
    case 'number':
      return (
        (await inferNumber(computer, text, options)) ??
        inferParseError(text, type.kind)
      );
    case 'string':
      return inferText(text);
    case 'anything':
    case 'nothing':
    case undefined: {
      if (!text) {
        return { type: { kind: 'anything' }, coerced: text };
      }
      return tryInferChain(computer, text, options);
    }
    default:
      return { type: type ?? inferParseError(text) } as CoercibleType;
  }
};
