import { Result, SerializedType } from '@decipad/language';
import DeciNumber from '@decipad/number';
import { formatError } from './formatError';
import { formatNumber } from './formatNumber';

export function formatResultPreview({ type, value }: Result.Result): string {
  switch (type.kind) {
    case 'number': {
      return formatNumber('en-US', type.unit, value as DeciNumber).asString;
    }

    case 'anything':
    case 'materialized-table':
    case 'table':
    case 'row':
    case 'function':
    case 'pending':
    case 'nothing': {
      // Rarely seen in the wild
      return type.kind;
    }

    case 'boolean': {
      return (value as boolean).toString();
    }

    case 'string': {
      return `${value as string}`;
    }

    case 'date': {
      return 'date';
    }

    case 'column': {
      return `column of ${type.cellType.kind}`;
    }

    case 'materialized-column': {
      /* eslint-disable-next-line no-use-before-define */
      return limitedColumnSizePreview(
        type.cellType,
        value as Result.OneResult[]
      );
    }

    case 'range': {
      const [start, end] = value as Result.OneResult[];
      const innerType = type.rangeOf;
      return `range(${formatResultPreview({
        type: innerType,
        value: start,
      })} through ${formatResultPreview({ type: innerType, value: end })})`;
    }

    case 'type-error': {
      return formatError('en-US', type.errorCause);
    }
  }
}

const LOOSE_PREVIEW_LIMIT = 25;
function limitedColumnSizePreview(
  cellType: SerializedType,
  value: Result.OneResult[]
): string {
  const ret: string[] = [];

  const len = () => ret.reduce((accum, item) => accum + item.length + 2, 0);

  for (const cell of value) {
    const fmt = formatResultPreview({ type: cellType, value: cell });

    if (len() + fmt.length > LOOSE_PREVIEW_LIMIT) {
      ret.push('...');
      break;
    } else {
      ret.push(fmt);
    }
  }

  return ret.join(', ');
}
