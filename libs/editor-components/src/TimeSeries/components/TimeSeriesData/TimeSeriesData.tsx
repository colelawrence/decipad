import type { FC, ReactNode } from 'react';
import type { AggregationKind, Column } from '../../types';
import type {
  TimeSeriesElement,
  TimeSeriesFilter,
} from '@decipad/editor-types';
import { TimeSeriesDataAlternatedRotationLayout } from '../TimeSeriesDataAlternatedRotationLayout/TimeSeriesDataAlternatedRotationLayout';
import { TimeSeriesDataLayout } from '../TimeSeriesDataLayout/TimeSeriesDataLayout';

interface TimeSeriesDataProps {
  element: TimeSeriesElement;
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  filters: Array<TimeSeriesFilter | undefined>;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
  rotate: boolean;
  headers: ReactNode[];
  alternateRotation?: boolean;
}

export const TimeSeriesData: FC<TimeSeriesDataProps> = ({
  alternateRotation,
  ...props
}) => {
  return alternateRotation ? (
    <TimeSeriesDataAlternatedRotationLayout
      {...props}
      blockId={props.element.id}
    />
  ) : (
    <TimeSeriesDataLayout {...props} />
  );
};
