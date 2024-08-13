import type DeciNumber from '@decipad/number';
import type {
  Result,
  SerializedType,
  Type,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Unit, serializeType } from '@decipad/language-types';

export const simpleMatrixFormatResult = (
  _locale: string,
  result: Result.OneResult | undefined | null,
  _type: Type | SerializedType
): string | number | boolean => {
  const type = serializeType(_type);
  switch (type.kind) {
    case 'boolean':
      return result as boolean;
    case 'pending':
    case 'nothing':
      return '';
    case 'string': {
      return result?.toString() ?? '';
    }
    case 'number': {
      return Unit.convertToMultiplierUnit(result as DeciNumber, type.unit)
        .round(4)
        .valueOf();
    }
    default:
      return '<Does not support exporting nested types>';
  }
};
