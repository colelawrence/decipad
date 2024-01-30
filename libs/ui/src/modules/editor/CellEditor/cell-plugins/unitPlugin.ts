import { useMemo } from 'react';
import type { CellPlugin } from '../types';
import { matchCellKind } from '../matchCellKind';
import { formatUnit } from '@decipad/format';

export const unitPlugin: CellPlugin = {
  query: matchCellKind('number'),
  useTransformValue: (value, { cellType }) => {
    const unit: string | undefined = useMemo(() => {
      if (
        cellType?.kind === 'number' &&
        cellType.unit &&
        value &&
        !Number.isNaN(Number(value))
      ) {
        return formatUnit('en-US', cellType.unit);
      }

      if (cellType?.kind === 'constant') {
        return cellType.constant.name;
      }

      return undefined;
    }, [cellType, value]);

    return unit ? `${value} ${unit}` : value;
  },
};
