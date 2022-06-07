import { FC } from 'react';
import { SerializedType, Interpreter } from '@decipad/computer';
import { PowerTableDataLayout } from '..';
import { AggregationKind } from '../../types';

interface PowerTableDataProps {
  values: Interpreter.ResultTable;
  types: SerializedType[];
  aggregationTypes: Array<AggregationKind | undefined>;
}

export const PowerTableData: FC<PowerTableDataProps> = (props) => {
  return <PowerTableDataLayout {...props} />;
};
