import { FC } from 'react';
import { CodeResult, DataViewTableHeader } from '@decipad/ui';
import { Result, SerializedType } from '@decipad/computer';
import { ValueCell } from '../../types';

interface DataViewTableHeaderProps {
  type?: SerializedType;
  value?: ValueCell;
  rowSpan?: number;
  colSpan?: number;
  onHover: (hover: boolean) => void;
  hover: boolean;
  alignRight?: boolean;
}

export const DataViewHeader: FC<DataViewTableHeaderProps> = ({
  type,
  value,
  rowSpan = 1,
  colSpan = 1,
  onHover,
  hover,
  alignRight,
}) => {
  if (type == null || value == null) {
    return null;
  }

  return (
    <DataViewTableHeader
      hover={hover}
      rowSpan={rowSpan}
      colSpan={colSpan}
      onHover={onHover}
      alignRight={alignRight}
    >
      <CodeResult
        value={value as Result.Result['value']}
        variant="inline"
        type={type}
      />
    </DataViewTableHeader>
  );
};
