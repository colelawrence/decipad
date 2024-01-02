import { useMemo } from 'react';
import { useComputer } from '@decipad/react-contexts';
import type { CellPlugin } from '../types';
import { matchCellKind } from '../matchCellKind';

export const unitPlugin: CellPlugin = {
  query: matchCellKind('number'),
  useTransformValue: (value, { cellType }) => {
    const computer = useComputer();

    const unit: string | undefined = useMemo(() => {
      if (
        cellType?.kind === 'number' &&
        cellType.unit &&
        value &&
        !Number.isNaN(Number(value))
      ) {
        return computer.formatUnit(cellType.unit);
      }

      if (cellType?.kind === 'constant') {
        return cellType.constant.name;
      }

      return undefined;
    }, [cellType, value, computer]);

    return unit ? `${value} ${unit}` : value;
  },
};
