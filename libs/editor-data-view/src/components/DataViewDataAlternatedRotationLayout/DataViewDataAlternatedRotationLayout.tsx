import { FC, ReactNode } from 'react';
import { AggregationKind, Column } from '../../types';
import { useDataViewLayoutData } from '../../hooks';
import { NestedGroups } from './NestedGroups';

export interface DataViewDataAlternatedRotationLayoutProps {
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
  rotate: boolean;
  headers: ReactNode[];
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
  });

  return (
    <tr>
      <td>
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
      </td>
    </tr>
  );
};
