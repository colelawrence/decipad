import { FC } from 'react';
import { templates } from '@decipad/ui';
import { useSmartColumn } from '../../hooks';
import { SmartProps } from '../DataViewDataLayout';

export const SmartCell: FC<SmartProps> = ({
  column,
  aggregationType,
  rowSpan,
  colSpan,
  onHover,
  hover,
  alignRight,
}: SmartProps) => {
  const smartColumn = useSmartColumn(column, aggregationType);
  return smartColumn?.columnAggregation === undefined ? null : (
    <templates.SmartCell
      aggregationType={aggregationType}
      aggregation={smartColumn?.columnAggregation}
      rowSpan={rowSpan}
      colSpan={colSpan}
      onHover={onHover}
      hover={hover}
      alignRight={alignRight}
    ></templates.SmartCell>
  );
};
