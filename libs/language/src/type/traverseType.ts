import produce from 'immer';
import type { SerializedType } from './SerializedType';

export function traverseType(
  givenType: SerializedType,
  fn: (type: SerializedType) => SerializedType
): SerializedType {
  const type = fn(givenType);

  switch (type.kind) {
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
      return produce(type, (t) => {
        t.rangeOf = traverseType(t.rangeOf, fn);
      });
    }

    case 'column': {
      return produce(type, (t) => {
        t.cellType = traverseType(t.cellType, fn);
      });
    }

    case 'table':
    case 'row':
    case 'function': {
      throw new Error(`cannot traverse type ${type.kind}`);
    }
  }
}
