import { FC, useContext } from 'react';
import { PlateComponentAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';
import {
  Opacity,
  p13Medium,
  strongOpacity,
  transparency,
} from '../../primitives';
import { table } from '../../styles';
import { DropLine } from '..';
import { DragHandle as DragHandleIcon } from '../../icons';
import {
  AvailableSwatchColor,
  baseSwatches,
  getStringType,
  getTypeIcon,
  TableStyleContext,
} from '../../utils';
import type { TableCellType } from '../../types';

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
  position: 'relative',
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

const transparent: Opacity = 0;
const opaque: Opacity = 1;

const dragHandleStyles = css({
  width: '12px',
  height: '14px',
  opacity: transparent,
  position: 'absolute',
  left: '12px',
  top: '8px',
  pointerEvents: 'all',
  ':hover': {
    opacity: opaque,
  },
});

const dropStyles = css({
  position: 'absolute',
  top: 0,
});

const leftDropStyles = css({
  left: '-13px',
});

const rightDropStyles = css({
  right: '-8px',
});

const editableChildrenWrapperStyles = css({
  width: '75px',
});

const DragHandle = () => {
  return (
    <button css={dragHandleStyles} contentEditable={false}>
      <DragHandleIcon />
    </button>
  );
};

const dragSurfaceWidth = '8px';
// This component is a drag detector that is over the table heading and
// captures mouse events.It does not interfere with the mouse events destined to the underlying components.
// We need to detect drag events and trigger the DnD behavior, and hovering
// the drag detector triggers it, without interfering with the text boxes underneath it.
// Tricky stuff...
const DragDetector = () => {
  return (
    <div
      css={css({ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 })}
    >
      {/* left */}
      <div
        css={css({
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: dragSurfaceWidth,
          pointerEvents: 'all',
        })}
      ></div>
      <div
        css={css({
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: dragSurfaceWidth,
          pointerEvents: 'all',
        })}
      ></div>
      <div
        css={css({
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: dragSurfaceWidth,
          pointerEvents: 'all',
        })}
      ></div>
      <div
        css={css({
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: dragSurfaceWidth,
          pointerEvents: 'all',
        })}
      ></div>
    </div>
  );
};

interface DropSourceAndTargetProps {
  dragSource: ConnectDragSource;
  dropTarget: ConnectDropTarget;
  draggingOver: boolean;
}

const DropSourceAndTarget = ({
  draggingOver,
  dragSource,
  dropTarget,
}: DropSourceAndTargetProps) => {
  return (
    <div
      css={css([
        {
          pointerEvents: draggingOver ? 'all' : 'none', // IMPORTANT!
          cursor: (draggingOver && 'grabbing') || undefined,
          position: 'absolute',
          left: '-13px',
          right: '-9px',
          top: 0,
          bottom: 0,
          height: '32px',
        },
      ])}
      ref={dragSource && dropTarget && ((node) => dragSource(dropTarget(node)))}
      contentEditable={false}
    >
      {!draggingOver && <DragDetector />}
      <DragHandle />
    </div>
  );
};

export interface TableHeaderProps {
  children?: React.ReactNode;
  highlight?: boolean;
  type?: TableCellType;
  menu?: React.ReactNode;
  attributes?: PlateComponentAttributes;
  isEditable?: boolean;
  showIcon?: boolean;
  // drag
  draggable?: boolean;
  draggingOver?: boolean;
  dragSource?: ConnectDragSource;
  // drop
  dropTarget?: ConnectDropTarget;
  dropDirection?: 'left' | 'right';
  dragPreview?: ConnectDragPreview;
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
  dragPreview,
}: TableHeaderProps): ReturnType<FC> => {
  const Icon = getTypeIcon(type);
  const { color } = useContext(TableStyleContext);

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
      <div css={headerWrapperStyles} ref={dragPreview}>
        {isEditable && draggingOver && dropDirection === 'left' && (
          <div css={[dropStyles, leftDropStyles]} contentEditable={false}>
            <DropLine variant="inline" />
          </div>
        )}
        {isEditable && draggable && dragSource && dropTarget && (
          <DropSourceAndTarget
            draggingOver={draggingOver}
            dragSource={dragSource}
            dropTarget={dropTarget}
          />
        )}

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
        {isEditable && draggingOver && dropDirection === 'right' && (
          <div css={[dropStyles, rightDropStyles]} contentEditable={false}>
            <DropLine variant="inline" />
          </div>
        )}
      </div>
    </th>
  );
};
