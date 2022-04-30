import { PlateComponentAttributes } from '@decipad/editor-types';
import { useStyle } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { FC } from 'react';
import { p13Medium, strongOpacity, transparency } from '../../primitives';
import { table } from '../../styles';
import type { TableCellType } from '../../types';
import {
  AvailableSwatchColor,
  baseSwatches,
  defaultTableColor,
  getStringType,
  getTypeIcon,
} from '../../utils';

const columnStyles = css(p13Medium, {
  display: 'grid',
  alignItems: 'center',

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
  overflow: 'hidden',
  textAlign: 'left',
});

const editableChildrenWrapperStyles = css({
  width: '75px',
});

export interface TableHeaderProps {
  children?: React.ReactNode;
  highlight?: boolean;
  type?: TableCellType;
  color?: AvailableSwatchColor;
  menu?: React.ReactNode;
  attributes?: PlateComponentAttributes;
  isEditable?: boolean;
  showIcon?: boolean;
}

export const TableHeader = ({
  children,
  highlight = false,
  type = getStringType(),
  menu,
  attributes,
  isEditable = false,
  showIcon = true,
}: TableHeaderProps): ReturnType<FC> => {
  const Icon = getTypeIcon(type);
  const { color = defaultTableColor } = useStyle();
  return (
    <th
      {...attributes}
      css={[
        columnStyles,
        css({
          backgroundColor:
            color &&
            transparency(
              baseSwatches[color as AvailableSwatchColor],
              strongOpacity
            ).rgba,
          // Keep hover effect when hovered, focused or the dropdown menu is opened.
          '&:hover, &:focus-within, &[data-highlight="true"]': {
            backgroundColor:
              color && baseSwatches[color as AvailableSwatchColor].rgb,
          },

          boxShadow:
            color &&
            `inset 0px -2px 0px ${
              baseSwatches[color as AvailableSwatchColor].rgb
            }`,
        }),
      ]}
      data-highlight={highlight}
    >
      <div css={headerWrapperStyles}>
        {showIcon && (
          <span contentEditable={false} css={columnTypeStyles}>
            <Icon />
          </span>
        )}
        <div
          css={[
            childrenWrapperStyles,
            isEditable && editableChildrenWrapperStyles,
          ]}
        >
          {children}
        </div>
        {menu}
      </div>
    </th>
  );
};
