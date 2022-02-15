import { Table, Type as ArrowType } from 'apache-arrow';
import { Type, build as t } from '../type';

export type DataTable = Table;

interface ToStringable {
  toString: () => string;
}

export function toInternalType(_type: ArrowType): Type {
  let type: string | ArrowType = _type;
  if (
    typeof _type === 'object' &&
    typeof (_type as ToStringable).toString === 'function'
  ) {
    type = (_type as ToStringable).toString();
  }
  switch (type) {
    case 'Bool':
    case ArrowType.Bool:
      return t.boolean();
    case 'Date':
    case 'DateMillisecond':
    case 'Date64<MILLISECOND>':
    case ArrowType.DateMillisecond:
      // TODO: get granularity from date
      return t.date('millisecond');
    case 'Float':
    case 'Float16':
    case 'Float32':
    case 'Float64':
    case ArrowType.Float:
    case ArrowType.Float16:
    case ArrowType.Float32:
    case ArrowType.Float64:
      return t.number();
    case 'Dictionary<Int32, Utf8>':
    case 'Utf8':
    case ArrowType.Utf8:
      return t.string();
    default:
      throw new Error(
        `Don't know how to convert from arrow type ${type} to internal type`
      );
  }
}
