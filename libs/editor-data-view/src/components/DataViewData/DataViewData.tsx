import { FC, ReactNode } from 'react';
import { DataViewDataLayout } from '..';
import { AggregationKind, Column } from '../../types';

interface DataViewDataProps {
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
  rotate: boolean;
  headers: ReactNode[];
}

export const DataViewData: FC<DataViewDataProps> = (props) => {
  return <DataViewDataLayout {...props} />;
};
