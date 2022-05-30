import { FC, ReactNode, useContext } from 'react';
import { css } from '@emotion/react';
import type { SerializedType } from '@decipad/computer';
import { PlateComponentAttributes } from '@decipad/editor-types';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';
import { normalOpacity, p13Medium, transparency } from '../../primitives';
import { table } from '../../styles';
import {
  AvailableSwatchColor,
  baseSwatches,
  getTypeIcon,
  TableStyleContext,
} from '../../utils';

import { DropLine } from '../DropLine/DropLine';

const columnStyles = css(p13Medium, {
  alignItems: 'center',
  verticalAlign: 'middle',
  cursor: 'pointer',
  position: 'relative',
});

const headerWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'left',
  gap: '6px',
  minHeight: table.thMinHeight,
  paddingLeft: table.cellSidePadding,
  paddingRight: '8px',
});

const columnTypeStyles = css({
  display: 'grid',
  alignItems: 'center',
  width: '12px',
  height: '12px',
});

const childrenWrapperStyles = css({
  whiteSpace: 'nowrap',
  textAlign: 'left',
});

const dropStyles = css({
  position: 'absolute',
  top: 0,
});

const leftDropStyles = css({
  left: '-2px',
});

const rightDropStyles = css({
  right: '1px',
});

export interface PowerTableColumnHeaderProps {
  name: string;
  type: SerializedType;
  attributes?: PlateComponentAttributes;
  children?: ReactNode;
  connectDragSource?: ConnectDragSource;
  connectDragPreview?: ConnectDragPreview;
  connectDropTarget?: ConnectDropTarget;
  overDirection?: 'left' | 'right';
}

export const PowerTableColumnHeader = ({
  name,
  type,
  attributes,
  children,
  connectDragSource,
  connectDropTarget,
  overDirection,
}: PowerTableColumnHeaderProps): ReturnType<FC> => {
  const { color } = useContext(TableStyleContext);
  const Icon = getTypeIcon(type);

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
              normalOpacity
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
    >
      {overDirection === 'left' && (
        <div css={[dropStyles, leftDropStyles]} contentEditable={false}>
          <DropLine variant="inline" />
        </div>
      )}
      <div ref={connectDropTarget}>
        <div css={headerWrapperStyles} ref={connectDragSource}>
          <span contentEditable={false} css={columnTypeStyles}>
            <Icon />
          </span>
          {name}
          <div css={childrenWrapperStyles}>{children}</div>
        </div>
      </div>
      {overDirection === 'right' && (
        <div css={[dropStyles, rightDropStyles]} contentEditable={false}>
          <DropLine variant="inline" />
        </div>
      )}
    </th>
  );
};
