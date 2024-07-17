import type { FC, ReactNode } from 'react';
import { DataViewDataAlternatedRotationLayout, DataViewDataLayout } from '..';
import type { AggregationKind, Column } from '../../types';
import type { DataViewElement, DataViewFilter } from '@decipad/editor-types';

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
