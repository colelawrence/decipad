import { FC, useMemo } from 'react';
import { DataViewStat } from '@decipad/react-contexts';
import { PlotResult, PlotSpec } from '../PlotResult/PlotResult';

export interface StatsGraphProps {
  stats: DataViewStat[];
}

const columns: Array<keyof DataViewStat> = ['computeLayoutElapsedTimeMs'];

export const DataViewStats: FC<StatsGraphProps> = ({ stats }) => {
  const specElapsed = useMemo(
    (): PlotSpec => ({
      data: {
        values: stats,
      },
      mark: { type: 'line', tooltip: { content: 'data' } },
      encoding: {
        x: {
          field: '_id',
          type: 'ordinal',
        },
        y: {
          field: 'computeLayoutElapsedTimeMs',
          type: 'quantitative',
        },
      },
    }),
    [stats]
  );

  const data = useMemo(
    () => ({
      values: stats,
    }),
    [stats]
  );
  return (
    <div>
      <PlotResult repeatedColumns={columns} spec={specElapsed} data={data} />
    </div>
  );
};
