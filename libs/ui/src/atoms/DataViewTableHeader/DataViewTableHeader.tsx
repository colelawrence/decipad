/* eslint decipad/css-prop-named-variable: 0 */
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
  rotate: boolean;
  isFirstLevelHeader: boolean;
}

const dataViewTableHeaderStyles = css({
  textAlign: 'left',
});

const dataViewTableHeaderAlignRightStyles = css({
  textAlign: 'right',
});

const dataViewTableHeaderGlobalStyles = css({
  color: cssVar('textSubdued'),
  backgroundColor: cssVar('backgroundDefault'),
});

const dataViewTableHeaderRotatedStyles = css({
  borderRight: `1px solid ${cssVar('borderSubdued')}`,
});

export const DataViewTableHeader: FC<DataViewTableHeaderProps> = ({
  rowSpan,
  colSpan,
  children,
  onHover = noop,
  alignRight = false,
  global = false,
  rotate,
  isFirstLevelHeader,
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
        alignRight && dataViewTableHeaderAlignRightStyles,
        !rotate && global && dataViewTableHeaderGlobalStyles,
        rotate && isFirstLevelHeader && dataViewTableHeaderRotatedStyles,
      ]}
    >
      {children}
    </th>
  );
};
