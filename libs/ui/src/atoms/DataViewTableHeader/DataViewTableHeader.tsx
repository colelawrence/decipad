import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode, useCallback } from 'react';

interface DataViewTableHeaderProps {
  children?: ReactNode;
  hover: boolean;
  rowSpan?: number;
  colSpan?: number;
  onHover?: (hover: boolean) => void;
  alignRight?: boolean;
}

const dataViewTableHeaderStyles = css({
  textAlign: 'left',
});

const alignRightStyles = css({
  textAlign: 'right',
});

export const DataViewTableHeader: FC<DataViewTableHeaderProps> = ({
  rowSpan,
  colSpan,
  children,
  onHover = noop,
  alignRight = false,
}) => {
  const onMouseOver = useCallback(() => onHover(true), [onHover]);
  const onMouseOut = useCallback(() => onHover(false), [onHover]);
  return (
    <th
      rowSpan={rowSpan}
      colSpan={colSpan}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      css={[dataViewTableHeaderStyles, alignRight ? alignRightStyles : null]}
    >
      {children}
    </th>
  );
};
