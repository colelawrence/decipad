import { FC } from 'react';
import { css } from '@emotion/react';
import { cssVar, p13Medium } from '../../primitives';
import { table } from '../../styles';

const headerStyles = css(p13Medium, {
  alignItems: 'center',
  paddingLeft: table.cellSidePadding,
  paddingRight: '8px',
  verticalAlign: 'middle',
  backgroundColor: cssVar('backgroundColor'),
});

const border = `1px solid ${cssVar('strongHighlightColor')}`;
const borderRadius = '6px';

const lastHeaderStyles = css({
  borderRight: border,
  borderBottom: border,
});

const bottomLeftHeaderStyles = css({
  borderBottomLeftRadius: borderRadius,
});

const headerWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'left',
  gap: '6px',
  position: 'relative',
  minHeight: table.thMinHeight,
});

const childrenWrapperStyles = css({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textAlign: 'left',
});

export interface TableHeaderProps {
  children?: React.ReactNode;
  rowSpan?: number;
  isLastHeader?: boolean;
  isBottomLeftHeader?: boolean;
}

export const PowerTableHeader = ({
  children,
  rowSpan = 1,
  isLastHeader = false,
  isBottomLeftHeader = false,
}: TableHeaderProps): ReturnType<FC> => {
  return (
    <th
      css={[
        headerStyles,
        isLastHeader && lastHeaderStyles,
        isBottomLeftHeader && bottomLeftHeaderStyles,
      ]}
      rowSpan={rowSpan}
    >
      <div css={headerWrapperStyles}>
        <div css={childrenWrapperStyles}>{children}</div>
      </div>
    </th>
  );
};
