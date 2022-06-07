import { FC } from 'react';
import { templates } from '@decipad/ui';
import { useSmartColumn } from '../../hooks';
import { SmartProps } from '../PowerTableDataLayout';

export const SmartCell: FC<SmartProps> = ({
  column,
  aggregationType,
  rowSpan,
  colSpan,
  onHover,
  hover,
}: SmartProps) => {
  const { columnAggregation } = useSmartColumn(column, aggregationType);
  return (
    <templates.SmartCell
      aggregationType={aggregationType}
      aggregation={columnAggregation}
      rowSpan={rowSpan}
      colSpan={colSpan}
      onHover={onHover}
      hover={hover}
    ></templates.SmartCell>
  );
};
