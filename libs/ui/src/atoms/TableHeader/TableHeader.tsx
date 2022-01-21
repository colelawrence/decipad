import { css } from '@emotion/react';
import { FC } from 'react';
import { getStringType, getTypeIcon } from '../../utils';
import { cssVar, grey250, p13Medium } from '../../primitives';
import { table } from '../../styles';
import { TableCellType } from '../../types';

const columnStyles = css(p13Medium, {
  display: 'grid',
  overflowX: 'hidden',
  alignItems: 'center',

  backgroundColor: cssVar('highlightColor'),
  // Keep hover effect when hovered, focused or the dropdown menu is opened.
  '&:hover, &:focus-within, &[data-highlight="true"]': {
    backgroundColor: cssVar('strongHighlightColor'),
  },

  boxShadow: `inset 0px -2px 0px ${grey250.rgb}`,

  minHeight: table.thMinHeight,
  paddingLeft: table.cellSidePadding,
  paddingRight: '8px',
  verticalAlign: 'middle',
});

const headerWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'left',
  gap: '6px',
  minHeight: '100%',
});

const columnTypeStyles = css({
  '& > svg': {
    height: '16px',
    width: '16px',
  },
});

export interface TableHeaderProps {
  children?: React.ReactNode;
  highlight?: boolean;
  icon?: React.ReactNode;
  type?: TableCellType;
}

export const TableHeader = ({
  children,
  highlight = false,
  icon,
  type = getStringType(),
}: TableHeaderProps): ReturnType<FC> => {
  const Icon = getTypeIcon(type);
  return (
    <th css={columnStyles} data-highlight={highlight}>
      <div css={headerWrapperStyles}>
        {icon ?? (
          <span css={columnTypeStyles}>
            <Icon />
          </span>
        )}
        {children}
      </div>
    </th>
  );
};
