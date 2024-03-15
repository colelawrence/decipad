import { FC, ReactNode } from 'react';
import { Spinner } from '@decipad/ui';
import { AggregationKind, Column } from '../../types';
import { useDataViewLayoutData } from '../../hooks';
import { NestedGroups } from './NestedGroups';
import { DataViewFilter } from '@decipad/editor-types';

export interface DataViewDataAlternatedRotationLayoutProps {
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
  rotate: boolean;
  headers: ReactNode[];
  filters: Array<DataViewFilter | undefined>;
}

export const DataViewDataAlternatedRotationLayout: FC<
  DataViewDataAlternatedRotationLayoutProps
> = ({
  tableName,
  columns,
  aggregationTypes,
  roundings,
  expandedGroups = [],
  onChangeExpandedGroups,
  rotate,
  filters,
}) => {
  const groups = useDataViewLayoutData({
    tableName,
    columns,
    aggregationTypes,
    roundings,
    expandedGroups,
    includeTotal: true,
    preventExpansion: rotate,
    rotate,
    filters,
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
            roundings={roundings}
            columnIndex={0}
          />
        ) : (
          <Spinner />
        )}
      </td>
    </tr>
  );
};
