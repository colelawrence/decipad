import { useMemo } from 'react';
import { defaultChartMargins, calculateTextWidth } from '../helpers';

interface UseChartMarginsProps {
  table: Record<string, any>[];
  yColumnNames: string[];
  xColumnName?: string;
  orientation: 'horizontal' | 'vertical';
}

export const useChartMargins = ({
  table,
  yColumnNames,
  xColumnName,
  orientation,
}: UseChartMarginsProps) => {
  const largestYColumnStringLength = useMemo(() => {
    return yColumnNames.reduce((maxAcc, columnName) => {
      const columnMax = table.reduce(
        (max, item) =>
          Math.max(
            max,
            String(
              orientation === 'horizontal'
                ? item[columnName]
                : item[xColumnName ?? '']
            ).length
          ),
        0
      );
      return Math.max(maxAcc, columnMax);
    }, 0);
  }, [table, yColumnNames, xColumnName, orientation]);

  return useMemo(() => {
    const marginRight = Math.min(
      calculateTextWidth({
        text: '0'.repeat(largestYColumnStringLength + 1),
        fontSize: 12,
      }),
      defaultChartMargins.right
    );

    return {
      ...defaultChartMargins,
      right: marginRight,
    };
  }, [largestYColumnStringLength]);
};
