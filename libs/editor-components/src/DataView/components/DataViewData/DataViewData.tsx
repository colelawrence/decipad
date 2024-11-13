import type { FC, ReactNode } from 'react';
import type { AggregationKind, Column } from '../../types';
import type { DataViewElement, DataViewFilter } from '@decipad/editor-types';
import { DataViewDataAlternatedRotationLayout } from '../DataViewDataAlternatedRotationLayout/DataViewDataAlternatedRotationLayout';
import { DataViewDataLayout } from '../DataViewDataLayout/DataViewDataLayout';

interface DataViewDataProps {
  element: DataViewElement;
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  filters: Array<DataViewFilter | undefined>;
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
    <DataViewDataAlternatedRotationLayout
      {...props}
      blockId={props.element.id ?? ''}
    />
  ) : (
    <DataViewDataLayout {...props} />
  );
};
