/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar } from '../../../primitives';

interface DataViewTableHeaderProps {
  children?: ReactNode;
  rowSpan?: number;
  colSpan?: number;
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
  alignRight = false,
  global = false,
  rotate,
  isFirstLevelHeader,
}) => {
  return (
    <th
      rowSpan={rowSpan}
      colSpan={colSpan}
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
