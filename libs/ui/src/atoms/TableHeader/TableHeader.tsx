import { PlateComponentAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p13Medium } from '../../primitives';
import { table } from '../../styles';
import type { TableCellType } from '../../types';
import { getStringType, getTypeIcon } from '../../utils';

const columnStyles = css(p13Medium, {
  display: 'grid',
  alignItems: 'center',

  backgroundColor: cssVar('highlightColor'),
  // Keep hover effect when hovered, focused or the dropdown menu is opened.
  '&:hover, &:focus-within, &[data-highlight="true"]': {
    backgroundColor: cssVar('strongHighlightColor'),
  },

  boxShadow: `inset 0px -2px 0px ${cssVar('strongHighlightColor')}`,

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
  display: 'grid',
  alignItems: 'center',
  width: '12px',
  height: '12px',
});

const childrenWrapperStyles = css({
  whiteSpace: 'nowrap',
  width: '75px',
  overflow: 'hidden',
  textAlign: 'left',
});

export interface TableHeaderProps {
  children?: React.ReactNode;
  highlight?: boolean;
  icon?: React.ReactNode;
  type?: TableCellType;
  menu?: React.ReactNode;
  attributes?: PlateComponentAttributes;
}

export const TableHeader = ({
  children,
  highlight = false,
  icon,
  type = getStringType(),
  menu,
  attributes,
}: TableHeaderProps): ReturnType<FC> => {
  const Icon = getTypeIcon(type);
  return (
    <th {...attributes} css={columnStyles} data-highlight={highlight}>
      <div css={headerWrapperStyles}>
        {icon ?? (
          <span css={columnTypeStyles}>
            <Icon />
          </span>
        )}
        <div css={childrenWrapperStyles}>{children}</div>
        {menu}
      </div>
    </th>
  );
};
