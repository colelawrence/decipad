import { FC } from 'react';
import { DataViewDataLayout } from '..';
import { AggregationKind, Column } from '../../types';

interface DataViewDataProps {
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
}

export const DataViewData: FC<DataViewDataProps> = (props) => {
  return <DataViewDataLayout {...props} />;
};
