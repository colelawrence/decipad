/* eslint decipad/css-prop-named-variable: 0 */
import type { CellValueType } from '@decipad/editor-types';
import { ElementAttributes } from '@decipad/editor-types';
import {
  useEditorTableContext,
  useThemeFromStore,
} from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { FC, forwardRef, useContext } from 'react';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';
import { useMergedRef } from '../../hooks/index';
import {
  AlignArrowLeft,
  AlignArrowRight,
  Delete,
  DragHandle as DragHandleIcon,
  Warning,
} from '../../icons';
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
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import { Tooltip } from '../Tooltip/Tooltip';

const columnStyles = css(p13Medium, {
  position: 'relative',

  minHeight: table.thMinHeight,
  padding: `${table.tdVerticalPadding} ${table.tdHorizontalPadding}`,

  ':hover .table-drag-handle': {
    display: 'block',
  },
});

const headerWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
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
  width: 9,
  height: 9,
  transform: 'translateY(50%)',
  display: 'block',
  margin: 'auto',
  pointerEvents: 'all',
  marginTop: 0,
  mixBlendMode: 'luminosity',
  'svg > rect': {
    fill: 'transparent',
  },
});

const DragHandle = () => {
  return (
    <div css={dragHandleStyles} contentEditable={false}>
      <DragHandleIcon />
    </div>
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
      className="table-drag-handle"
      css={[
        columnTypeStyles,
        {
          pointerEvents: !draggingOver ? 'all' : 'none', // IMPORTANT!
          width: '16px',
          height: '16px',
          display: 'none',
          borderRadius: '6px',
          cursor: 'grab',
          ':hover': {
            background: dragHandleHighlight,
          },
        },
      ]}
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
  readonly children?: React.ReactNode;
  readonly highlight?: boolean;
  readonly type?: CellValueType;
  readonly menu?: React.ReactNode;
  readonly attributes?: ElementAttributes;
  readonly isEditable?: boolean;
  readonly showIcon?: boolean;
  readonly isLiveResult?: boolean;
  readonly onRemoveColumn?: () => void;
  readonly onAddColRight?: () => void;
  readonly onAddColLeft?: () => void;
  // drag
  readonly draggable?: boolean;
  readonly dragSource?: ConnectDragSource;
  readonly dragPreview?: ConnectDragPreview;
  // drop
  readonly dropTarget?: ConnectDropTarget;
  readonly dropDirection?: 'left' | 'right';
  readonly onSelectColumn?: () => void;
  readonly error?: string;
  readonly isFirst?: boolean;
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
  isLiveResult = false,
  onAddColLeft,
  onAddColRight,
  onRemoveColumn,
  dragSource,
  dropTarget,
  dropDirection,
  onSelectColumn,
  isFirst,
  error,
}: TableHeaderProps): ReturnType<FC> => {
  const Icon = getTypeIcon(type);
  const [darkTheme] = useThemeFromStore();
  const { color } = useContext(TableStyleContext);
  const baseSwatches = swatchesThemed(darkTheme);

  const editorTableContext = useEditorTableContext();
  const { length } = editorTableContext.cellTypes;

  const thRef = useMergedRef(attributes?.ref, dropTarget);

  const columOptionItems = [
    {
      label: 'Add column left',
      onClick: onAddColLeft,
      icon: <AlignArrowLeft />,
      disabled: isFirst,
    },
    {
      label: 'Add column right',
      onClick: onAddColRight,
      icon: <AlignArrowRight />,
      disabled: isFirst,
    },
    {
      label: 'Remove column',
      onClick: onRemoveColumn,
      icon: <Delete />,
      disabled: length === 1,
    },
  ];

  return (
    <th
      {...attributes}
      data-testid="table-header"
      css={[
        columnStyles,
        thStyles(color as AvailableSwatchColor, darkTheme, baseSwatches),
        isEditable && {
          ':hover .table-icon': {
            display: 'none',
          },
        },
        isLiveResult && {
          ':hover .table-icon': {
            display: 'block',
          },
        },
      ]}
      ref={thRef}
      data-highlight={highlight}
      contentEditable={isEditable}
    >
      {dropDirection === 'left' && (
        <ColumnDropLine dropDirection={dropDirection} adjustLeft={1} />
      )}

      <div css={headerWrapperStyles}>
        <span css={{ width: '16px', height: '16px' }} contentEditable={false}>
          {draggable && dragSource && !error && isEditable && (
            <DropdownMenu
              items={columOptionItems}
              testId="table-add-remove-column-button"
              readonly={!isEditable}
              trigger={
                <DropSourceAndTarget
                  ref={dragSource}
                  draggingOver={draggingOver}
                  onSelectColumn={onSelectColumn}
                />
              }
            />
          )}

          {error && (
            <DropdownMenu
              items={columOptionItems}
              testId="table-add-remove-column-button"
              readonly={!isEditable}
              trigger={
                <Tooltip
                  hoverOnly
                  trigger={
                    <span contentEditable={false} css={iconTypeStyles}>
                      <Warning />
                    </span>
                  }
                >
                  {type.kind !== 'table-formula'
                    ? error
                    : "There's a problem with your formulas"}
                </Tooltip>
              }
            />
          )}

          {showIcon && !error && (
            <span
              contentEditable={false}
              css={iconTypeStyles}
              className="table-icon"
            >
              <Icon />
            </span>
          )}
        </span>

        <div
          data-testid="table-column-name"
          css={[childrenWrapperStyles]}
          spellCheck={false}
        >
          {children}
        </div>
        {menu}
      </div>

      {dropDirection === 'right' && (
        <ColumnDropLine dropDirection={dropDirection} />
      )}
    </th>
  );
};
