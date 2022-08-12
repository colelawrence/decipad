import { FC } from 'react';
import { SerializedType, Interpreter } from '@decipad/computer';
import { DataViewDataLayout } from '..';
import { AggregationKind } from '../../types';

interface DataViewDataProps {
  values: Interpreter.ResultTable;
  types: SerializedType[];
  aggregationTypes: Array<AggregationKind | undefined>;
}

export const DataViewData: FC<DataViewDataProps> = (props) => {
  return <DataViewDataLayout {...props} />;
};
