import { formatResult } from '@decipad/format';
import type DeciNumber from '@decipad/number';
import type { Result, SerializedType, Type } from '@decipad/remote-computer';
import { Unit, serializeType } from '@decipad/remote-computer';

export const simpleFormatResult = (
  locale: string,
  result: Result.OneResult | undefined | null,
  _type: Type | SerializedType
): string => {
  const type = serializeType(_type);
  switch (type.kind) {
    case 'pending':
    case 'nothing':
      return '';
    case 'string': {
      return JSON.stringify(result);
    }
    case 'number': {
      return Unit.convertToMultiplierUnit(result as DeciNumber, type.unit)
        .round(4)
        .toString(4);
    }
    default:
      return formatResult(locale, result, type, undefined, simpleFormatResult);
  }
};
