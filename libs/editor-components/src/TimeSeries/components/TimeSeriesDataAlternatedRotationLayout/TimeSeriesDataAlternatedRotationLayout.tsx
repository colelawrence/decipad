import type { FC, ReactNode } from 'react';
import { Spinner } from '@decipad/ui';
import type { AggregationKind, Column } from '../../types';
import { useTimeSeriesLayoutData } from '../../hooks';
import { NestedGroups } from './NestedGroups';
import type { TimeSeriesFilter } from '@decipad/editor-types';

export interface TimeSeriesDataAlternatedRotationLayoutProps {
  blockId: string;
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  filters: Array<TimeSeriesFilter | undefined>;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
  rotate: boolean;
  headers: ReactNode[];
}

export const TimeSeriesDataAlternatedRotationLayout: FC<
  TimeSeriesDataAlternatedRotationLayoutProps
> = ({
  blockId,
  tableName,
  columns,
  aggregationTypes,
  roundings,
  filters,
  expandedGroups = [],
  onChangeExpandedGroups,
  rotate,
}) => {
  const groups = useTimeSeriesLayoutData({
    blockId,
    tableName,
    columns,
    aggregationTypes,
    roundings,
    filters,
    expandedGroups,
    includeTotal: true,
    preventExpansion: rotate,
  });

  return (
    <tr>
      <td>
        {groups ? (
          <NestedGroups
            tableName={tableName}
            aggregationTypes={aggregationTypes}
            groups={groups}
            expandedGroups={expandedGroups}
            onChangeExpandedGroups={onChangeExpandedGroups}
            rotate={rotate}
            columnIndex={0}
          />
        ) : (
          <Spinner />
        )}
      </td>
    </tr>
  );
};
