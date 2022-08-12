import { noop } from '@decipad/utils';
import { FC, ReactNode, useCallback } from 'react';

interface DataViewTableHeaderProps {
  children?: ReactNode;
  hover: boolean;
  rowSpan?: number;
  colSpan?: number;
  onHover?: (hover: boolean) => void;
}

export const DataViewTableHeader: FC<DataViewTableHeaderProps> = ({
  rowSpan,
  colSpan,
  children,
  onHover = noop,
}) => {
  const onMouseOver = useCallback(() => onHover(true), [onHover]);
  const onMouseOut = useCallback(() => onHover(false), [onHover]);
  return (
    <th
      rowSpan={rowSpan}
      colSpan={colSpan}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {children}
    </th>
  );
};
