import type { CellValueType } from '@decipad/editor-types';
import { ElementAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { FC, forwardRef, useContext } from 'react';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';
import { useMergedRef } from '../../hooks/index';
import { DragHandle as DragHandleIcon } from '../../icons';
import { p13Medium, strongOpacity, transparency } from '../../primitives';
import { table } from '../../styles';
import {
  AvailableSwatchColor,
  baseSwatches,
  getStringType,
  getTypeIcon,
  TableStyleContext,
} from '../../utils';
import { ColumnDropLine } from '../DropLine/ColumnDropLine';

const columnStyles = css(p13Medium, {
  position: 'relative',

  minHeight: table.thMinHeight,
  paddingLeft: table.tdHorizontalPadding,
  paddingRight: '8px',
});

const headerWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  minHeight: '30px',
  gap: '6px',
  position: 'relative',
});

const columnTypeStyles = css({
  display: 'inline-block',
  width: '12px',
  height: '12px',
});

const childrenWrapperStyles = css({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textAlign: 'left',
});

const dragHandleStyles = css({
  width: '12px',
  height: '14px',
  pointerEvents: 'all',
  marginTop: '-1px',
  'svg > rect': {
    fill: 'transparent',
  },
  cursor: 'grab',
});

const DragHandle = () => {
  return (
    <button css={dragHandleStyles} contentEditable={false}>
      <DragHandleIcon />
    </button>
  );
};

interface DropSourceAndTargetProps {
  draggingOver: boolean;
  onSelectColumn?: () => void;
}

const DropSourceAndTarget = forwardRef<
  HTMLDivElement,
  DropSourceAndTargetProps
>(({ draggingOver, onSelectColumn }, ref) => {
  return (
    <div
      css={css([
        columnTypeStyles,
        {
          pointerEvents: draggingOver ? 'all' : 'none', // IMPORTANT!
          height: '32px',
          display: 'flex',
          alignItems: 'center',
        },
      ])}
      ref={ref}
      contentEditable={false}
      onClick={onSelectColumn}
    >
      <DragHandle />
    </div>
  );
});

const thStyles = (color: AvailableSwatchColor) =>
  css({
    backgroundColor:
      color &&
      transparency(baseSwatches[color as AvailableSwatchColor], strongOpacity)
        .rgba,
    // Keep hover effect when hovered, focused or the dropdown menu is opened.
    '&:hover, &:focus-within, &[data-highlight="true"]': {
      backgroundColor: color && baseSwatches[color as AvailableSwatchColor].rgb,
    },

    boxShadow:
      color &&
      `inset 0px -2px 0px ${baseSwatches[color as AvailableSwatchColor].rgb}`,
  });
export interface TableHeaderProps extends Partial<DropSourceAndTargetProps> {
  children?: React.ReactNode;
  highlight?: boolean;
  type?: CellValueType;
  menu?: React.ReactNode;
  attributes?: ElementAttributes;
  isEditable?: boolean;
  showIcon?: boolean;
  // drag
  draggable?: boolean;
  dragSource?: ConnectDragSource;
  dragPreview?: ConnectDragPreview;
  // drop
  dropTarget?: ConnectDropTarget;
  dropDirection?: 'left' | 'right';
}

export const TableHeader = ({
  children,
  highlight = false,
  type = getStringType(),
  menu,
  attributes,
  isEditable = false,
  showIcon = true,
  draggable = false,
  draggingOver = false,
  dragSource,
  dropTarget,
  dropDirection,
  onSelectColumn,
}: TableHeaderProps): ReturnType<FC> => {
  const Icon = getTypeIcon(type);
  const { color } = useContext(TableStyleContext);

  const thRef = useMergedRef(attributes?.ref, dropTarget);

  // const useBackGroundColor = variant === 'bland' ? color : 'Perfume';

  return (
    <th
      {...attributes}
      css={[columnStyles, thStyles(color)]}
      ref={thRef}
      data-highlight={highlight}
    >
      {isEditable && dropDirection === 'left' && (
        <ColumnDropLine dropDirection={dropDirection} />
      )}

      <div css={headerWrapperStyles}>
        {isEditable && draggable && dragSource && (
          <DropSourceAndTarget
            ref={dragSource}
            draggingOver={draggingOver}
            onSelectColumn={onSelectColumn}
          />
        )}
        <div css={[childrenWrapperStyles]}>{children}</div>
        {menu}
        {showIcon && (
          <span contentEditable={false} css={columnTypeStyles}>
            <Icon />
          </span>
        )}
      </div>

      {isEditable && dropDirection === 'right' && (
        <ColumnDropLine dropDirection={dropDirection} />
      )}
    </th>
  );
};
