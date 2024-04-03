import { FC, ReactNode } from 'react';
import { Spinner } from '@decipad/ui';
import { AggregationKind, Column } from '../../types';
import { useDataViewLayoutData } from '../../hooks';
import { NestedGroups } from './NestedGroups';
import { DataViewFilter } from '@decipad/editor-types';

export interface DataViewDataAlternatedRotationLayoutProps {
  blockId: string;
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  filters: Array<DataViewFilter | undefined>;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
  rotate: boolean;
  headers: ReactNode[];
}

export const DataViewDataAlternatedRotationLayout: FC<
  DataViewDataAlternatedRotationLayoutProps
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
  const groups = useDataViewLayoutData({
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
