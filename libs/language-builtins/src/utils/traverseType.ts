// eslint-disable-next-line no-restricted-imports
import { type SerializedType } from '@decipad/language-interfaces';
import { produce } from '@decipad/utils';

// eslint-disable-next-line complexity
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
    case 'trend': {
      const { trendOf } = type;
      return produce(type, (t) => {
        t.trendOf = traverseType(trendOf, fn);
      });
    }

    case 'table':
    case 'tree':
    case 'materialized-table':
    case 'row':
    case 'function': {
      throw new Error(`cannot traverse type ${type.kind}`);
    }
  }
}
