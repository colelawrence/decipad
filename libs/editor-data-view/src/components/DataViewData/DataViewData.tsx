import { FC, ReactNode } from 'react';
import { DataViewDataAlternatedRotationLayout, DataViewDataLayout } from '..';
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
  alternateRotation?: boolean;
}

export const DataViewData: FC<DataViewDataProps> = ({
  alternateRotation,
  ...props
}) => {
  return alternateRotation ? (
    <DataViewDataAlternatedRotationLayout {...props} />
  ) : (
    <DataViewDataLayout {...props} />
  );
};
