import { SerializedType } from '@decipad/language';
import { formatUnit } from './formatUnit';

export const formatTypeToBasicString = (
  locale: string,
  type: SerializedType
): string => {
  switch (type.kind) {
    case 'type-error':
      throw new Error('toBasicString: errors not supported');
    case 'number':
      return type.unit ? formatUnit(locale, type.unit) : 'number';
    case 'date':
      return `date(${type.date})`;
    default:
      return type.kind;
  }
};
