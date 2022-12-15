import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, MouseEvent, ReactNode, useCallback } from 'react';
import { cssVar } from '../../primitives';

interface DataViewTableHeaderProps {
  children?: ReactNode;
  hover: boolean;
  rowSpan?: number;
  colSpan?: number;
  onHover?: (hover: boolean) => void;
  alignRight?: boolean;
  global?: boolean;
}

const dataViewTableHeaderStyles = css({
  textAlign: 'left',
});

const alignRightStyles = css({
  textAlign: 'right',
});

const globalStyles = css({
  color: cssVar('weakTextColor'),
  backgroundColor: cssVar('highlightColor'),
});

export const DataViewTableHeader: FC<DataViewTableHeaderProps> = ({
  rowSpan,
  colSpan,
  children,
  onHover = noop,
  alignRight = false,
  global = false,
}) => {
  const onMouseOver = useCallback(
    (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      onHover(true);
    },
    [onHover]
  );
  const onMouseOut = useCallback(
    (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      onHover(false);
    },
    [onHover]
  );
  return (
    <th
      rowSpan={rowSpan}
      colSpan={colSpan}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      css={[
        dataViewTableHeaderStyles,
        alignRight && alignRightStyles,
        global && globalStyles,
      ]}
    >
      {children}
    </th>
  );
};
