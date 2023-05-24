import type { CellValueType } from '@decipad/editor-types';
import { ElementAttributes } from '@decipad/editor-types';
import { useThemeFromStore } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { FC, ReactNode, forwardRef, useContext } from 'react';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';
import { useMergedRef } from '../../hooks/index';
import { DragHandle as DragHandleIcon, Warning } from '../../icons';
import {
  cssVar,
  dragHandleHighlight,
  p13Medium,
  strongOpacity,
  transparency,
} from '../../primitives';
import { table } from '../../styles';
import {
  AvailableSwatchColor,
  Swatch,
  TableStyleContext,
  getStringType,
  getTypeIcon,
  swatchesThemed,
} from '../../utils';
import { ColumnDropLine } from '../DropLine/ColumnDropLine';
import { Tooltip } from '../Tooltip/Tooltip';

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
  width: '16px',
  height: '16px',
});

const iconTypeStyles = css(columnTypeStyles, {
  svg: {
    width: '16px',
    height: '16px',
  },
});

const childrenWrapperStyles = css({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textAlign: 'left',
  minWidth: '5px',
  padding: '0 4px',
  borderRadius: '6px',
  mixBlendMode: 'luminosity',
});

const dragHandleStyles = css({
  width: '8px',
  height: 9,
  transform: 'translateY(50%)',
  display: 'block',
  margin: 'auto',
  cursor: 'grab',
  pointerEvents: 'all',
  marginTop: 0,
  mixBlendMode: 'luminosity',
  'svg > rect': {
    fill: 'transparent',
  },
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
          height: '18px',
          width: '18px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '6px',
          ':hover': {
            background: dragHandleHighlight,
          },
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

const thStyles = (
  color: AvailableSwatchColor,
  darkMode: boolean,
  baseSwatches: Swatch
) =>
  css({
    backgroundColor: color
      ? transparency(baseSwatches[color as AvailableSwatchColor], strongOpacity)
          .rgba
      : cssVar('strongHighlightColor'),
    // Keep hover effect when hovered, focused or the dropdown menu is opened.
    '&:hover, &:focus-within, &[data-highlight="true"]': {
      backgroundColor:
        color && swatchesThemed(darkMode)[color as AvailableSwatchColor].rgb,
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
  error?: ReactNode;
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
  error,
}: TableHeaderProps): ReturnType<FC> => {
  const Icon = getTypeIcon(type);

  const [darkTheme] = useThemeFromStore();
  const { color } = useContext(TableStyleContext);
  const baseSwatches = swatchesThemed(darkTheme);

  const thRef = useMergedRef(attributes?.ref, dropTarget);

  return (
    <th
      {...attributes}
      css={[
        columnStyles,
        thStyles(color as AvailableSwatchColor, darkTheme, baseSwatches),
      ]}
      ref={thRef}
      data-highlight={highlight}
      contentEditable={isEditable}
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
        {showIcon && type.kind !== 'anything' && (
          <>
            {error ? (
              <Tooltip
                hoverOnly
                trigger={
                  <span contentEditable={false} css={iconTypeStyles}>
                    <Warning />
                  </span>
                }
              >
                There's a problem with your formulas
              </Tooltip>
            ) : (
              <span contentEditable={false} css={iconTypeStyles}>
                <Icon />
              </span>
            )}
          </>
        )}

        <div css={[childrenWrapperStyles]} spellCheck={false}>
          {children}
        </div>
        {menu}
      </div>

      {isEditable && dropDirection === 'right' && (
        <ColumnDropLine dropDirection={dropDirection} />
      )}
    </th>
  );
};
