import produce from 'immer';
import type { SerializedType } from './SerializedType';

export function traverseType(
  givenType: SerializedType,
  fn: (type: SerializedType) => SerializedType
): SerializedType {
  const type = fn(givenType);

  switch (type.kind) {
    case 'pending':
    case 'nothing':
    case 'anything':
    case 'type-error':
    case 'boolean':
    case 'string':
    case 'number':
    case 'date': {
      return type;
    }

    case 'range': {
      const { rangeOf } = type;
      return produce(type, (t) => {
        t.rangeOf = traverseType(rangeOf, fn);
      });
    }

    case 'column':
    case 'materialized-column': {
      const { cellType } = type;
      return produce(type, (t) => {
        t.cellType = traverseType(cellType, fn);
      });
    }

    case 'table':
    case 'materialized-table':
    case 'row':
    case 'function': {
      throw new Error(`cannot traverse type ${type.kind}`);
    }
  }
}
