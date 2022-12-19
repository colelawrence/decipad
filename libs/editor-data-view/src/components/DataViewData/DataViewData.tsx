import { FC } from 'react';
import { SerializedType, Interpreter } from '@decipad/computer';
import { DataViewDataLayout } from '..';
import { AggregationKind } from '../../types';

interface DataViewDataProps {
  tableName: string;
  columnNames: string[];
  values: Interpreter.ResultTable;
  types: SerializedType[];
  aggregationTypes: Array<AggregationKind | undefined>;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
}

export const DataViewData: FC<DataViewDataProps> = (props) => {
  return <DataViewDataLayout {...props} />;
};
