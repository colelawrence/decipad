import type { SerializedType } from '@decipad/computer';
import { CoercibleType } from '../types';
import { inferBoolean } from './inferBoolean';
import { inferDate } from './inferDate';
import { inferExpression } from './inferExpression';
import { inferText } from './inferText';
import { inferNumber } from './inferNumber';

const inferParseError = (
  text: string,
  kind: SerializedType['kind']
): CoercibleType => ({
  type: {
    kind: 'type-error',
    errorCause: {
      errType: 'free-form',
      message: `Cannot parse ${kind} out of "${text}"`,
    },
  },
  coerced: text,
});

export const inferType = (
  _text: string,
  type?: SerializedType
): CoercibleType => {
  const text = _text.trim();

  switch (type?.kind) {
    case 'boolean':
      return inferBoolean(text) ?? inferParseError(text, type.kind);
    case 'date':
      return inferDate(text) ?? inferParseError(text, type.kind);
    case 'number':
      return inferNumber(text) ?? inferParseError(text, type.kind);
    case 'string':
      return inferText(text) ?? inferParseError(text, type.kind);
    default:
      return (
        inferBoolean(text) ??
        inferNumber(text) ??
        inferDate(text) ??
        inferExpression(text) ??
        inferText(text)
      );
  }
};
