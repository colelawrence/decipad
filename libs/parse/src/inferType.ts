import type { Computer, SerializedType } from '@decipad/computer';
import { CellValueType } from '@decipad/editor-types';
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
  type?: CellValueType;
  doNotTryExpressionNumbersParse?: boolean;
}

export const inferType = async (
  computer: Computer,
  _text: string,
  options: InferTypeOptions = {}
): Promise<CoercibleType> => {
  const text = _text.trim();

  const { type } = options;

  switch (type?.kind) {
    case 'table-formula':
      return { type };
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
      return inferText(text) ?? inferParseError(text, type.kind);
    case 'anything':
    case 'nothing':
    case undefined: {
      if (!text) {
        return { type: { kind: 'anything' }, coerced: text };
      }
      return (
        inferDate(text, 'month') ??
        inferDate(text, 'day') ??
        inferBoolean(text) ??
        (await inferNumber(computer, text, options)) ??
        inferDate(text) ??
        (options.doNotTryExpressionNumbersParse
          ? undefined
          : await inferExpression(computer, text)) ??
        inferParseError(text)
      );
    }
    default:
      return { type: type ?? inferParseError(text) } as CoercibleType;
  }
};
