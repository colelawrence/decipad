import {
  type Result,
  type SerializedType,
  Format,
  buildResult,
} from '@decipad/remote-computer';
import type DeciNumber from '@decipad/number';
import { formatResult } from './formatResult';

const DEFAULT_LOCALE = 'en-US';

export function formatResultPreview({ type, value }: Result.Result): string {
  switch (type.kind) {
    case 'number': {
      return Format.formatNumber('en-US', type.unit, value as DeciNumber)
        .asString;
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
      return `${value?.toString() || ''}`;
    }

    case 'date': {
      return formatResult(DEFAULT_LOCALE, value, type);
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
      return `range(${formatResultPreview(
        buildResult(innerType, start, false)
      )} through ${formatResultPreview({
        type: innerType,
        value: end,
      } as Result.Result)})`;
    }

    case 'tree':
      return 'tree';

    case 'type-error': {
      return Format.formatError('en-US', type.errorCause);
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
    const fmt = formatResultPreview(buildResult(cellType, cell, false));

    if (len() + fmt.length > LOOSE_PREVIEW_LIMIT) {
      ret.push('...');
      break;
    } else {
      ret.push(fmt);
    }
  }

  return ret.join(', ');
}
