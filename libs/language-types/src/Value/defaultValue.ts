import DeciNumber from '@decipad/number';
import { getDefined } from '@decipad/utils';
import { Type, serializeType } from '../Type';
import { SerializedType, SerializedTypes } from '../SerializedType';
import { Value } from './Value';
import { UnknownValue } from './Unknown';
import { Scalar } from './Scalar';
import { EmptyColumn } from './EmptyColumn';
import { DateValue } from './Date';
import { Table } from './Table';
import { NumberValue } from './Number';
import { Range } from './Range';
import { Row } from './Row';

// eslint-disable-next-line complexity
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
