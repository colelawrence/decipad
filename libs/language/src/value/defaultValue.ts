import DeciNumber from '@decipad/number';
import { getDefined } from '@decipad/utils';
import { EmptyColumn } from '../lazy';
import { UnknownValue } from '../result';
import { SerializedType, SerializedTypes, Type, serializeType } from '../type';
import { DateValue, NumberValue, Range, Row, Scalar, Table } from './Value';
import { Value } from './types';

export const defaultValue = (
  type: Type | SerializedType | SerializedType['kind'] | undefined
): Value => {
  if (type == null) {
    return UnknownValue;
  }
  const stype = typeof type !== 'string' ? serializeType(type) : undefined;
  const kind: string = stype ? stype.kind : (type as string);

  switch (kind) {
    case 'nothing':
    case 'anything':
    case 'pending':
    case 'type-error':
    case 'function':
      return UnknownValue;
    case 'boolean':
      return Scalar.fromValue(false);
    case 'materialized-column':
    case 'column':
      return new EmptyColumn([]);
    case 'date':
      return new DateValue(
        undefined,
        getDefined(stype as SerializedTypes.Date).date
      );
    case 'table':
    case 'materialized-table':
      return new Table([], []);
    case 'number':
      return NumberValue.fromValue(new DeciNumber(undefined));
    case 'range':
      return new Range({ start: UnknownValue, end: UnknownValue });
    case 'row':
      return new Row([], []);
    case 'string':
      return Scalar.fromValue('');
  }
  throw new Error('panic: unreachable');
};
