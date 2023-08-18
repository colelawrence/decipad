/* eslint decipad/css-prop-named-variable: 0 */
import type { CellValueType } from '@decipad/editor-types';
import { ElementAttributes } from '@decipad/editor-types';
import {
  useCurrentWorkspaceStore,
  useEditorTableContext,
  useThemeFromStore,
} from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import {
  FC,
  MouseEvent,
  ReactNode,
  forwardRef,
  useCallback,
  useContext,
  useRef,
  useState,
  useMemo,
} from 'react';
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
  Sparkles,
  Text,
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
import { tdMinWidth } from '../../styles/table';
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
import { UpgradePlanWarningTooltip } from '../UpgradePlanWarning/UpgradePlanWarningTooltip';

interface DropSourceAndTargetProps {
  readonly draggingOver: boolean;
  readonly toggleOpen: () => void;
  readonly onSelectColumn?: () => void;
  readonly icon?: ReactNode;
}

export interface TableHeaderProps extends Partial<DropSourceAndTargetProps> {
  width?: number;
  setWidth?: (width: number) => void;
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
  readonly onPopulateColumn?: () => void;
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
  readonly readOnly?: boolean;
}

const DragHandle = () => {
  return (
    <div css={dragHandleStyles} contentEditable={false}>
      <DragHandleIcon />
    </div>
  );
};

const DropSourceAndTarget = forwardRef<
  HTMLDivElement,
  DropSourceAndTargetProps
>(({ draggingOver, onSelectColumn, toggleOpen, icon = <Text /> }, ref) => {
  return (
    <div
      css={[
        {
          pointerEvents: !draggingOver ? 'all' : 'none', // IMPORTANT!
          cursor: 'grab',
          'span:first-of-type': {
            display: 'block',
          },
          'span:last-of-type': {
            display: 'none',
          },
          ':hover, :active, :focus': {
            background: dragHandleHighlight,
            'span:first-of-type': {
              display: 'none',
            },
            'span:last-of-type': {
              display: 'block',
            },
          },
        },
      ]}
      ref={ref}
      contentEditable={false}
      onClick={() => {
        onSelectColumn?.();
        toggleOpen();
      }}
    >
      <span>{icon}</span>
      <span>
        <DragHandle />
      </span>
    </div>
  );
});

export const TableHeader = ({
  children,
  highlight = false,
  type = getStringType(),
  menu,
  width,
  setWidth,
  readOnly = false,
  attributes,
  isEditable = false,
  showIcon = true,
  draggable = false,
  draggingOver = false,
  isLiveResult = false,
  onAddColLeft,
  onAddColRight,
  onRemoveColumn,
  onPopulateColumn,
  dragSource,
  dropTarget,
  dropDirection,
  onSelectColumn,
  isFirst,
  error,
}: TableHeaderProps): ReturnType<FC> => {
  const tempWidth = useRef<number | undefined>(undefined);
  const [open, onChangeOpen] = useState(false);
  const {
    workspaceInfo: { queryCount, quotaLimit, id },
    isQuotaLimitBeingReached,
  } = useCurrentWorkspaceStore();

  const toggleOpen = useCallback(() => {
    onChangeOpen(!open);
  }, [open]);

  const shouldDisableAI = useMemo(() => {
    return !!quotaLimit && !!queryCount && queryCount >= quotaLimit;
  }, [quotaLimit, queryCount]);

  const Icon = getTypeIcon(type);
  const [darkTheme] = useThemeFromStore();
  const { color } = useContext(TableStyleContext);
  const baseSwatches = swatchesThemed(darkTheme);

  const editorTableContext = useEditorTableContext();
  const { length } = editorTableContext.cellTypes;

  const thRef = useMergedRef(attributes?.ref, dropTarget);
  const sizeRef = useRef<HTMLDivElement>(null);

  const handleResize = (mouseDownEvent: MouseEvent) => {
    if (readOnly) {
      return;
    }

    mouseDownEvent.preventDefault();
    mouseDownEvent.stopPropagation();

    document.body.style.cursor = 'col-resize';

    const startSize =
      tempWidth.current ?? sizeRef.current?.offsetWidth ?? width ?? 150;
    const startPosition = mouseDownEvent.pageX;

    const onMouseMove = (mouseMoveEvent: MouseEvent) => {
      const newWidth = startSize - startPosition + mouseMoveEvent.pageX;
      if (newWidth < tdMinWidth) {
        return;
      }
      tempWidth.current = newWidth;
      setWidth?.(tempWidth.current);
    };

    const onMouseUp = () => {
      // @ts-ignore
      document.body.removeEventListener('mousemove', onMouseMove);
      tempWidth.current = undefined;
      document.body.style.cursor = 'auto';
    };

    // @ts-ignore
    document.body.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseup', onMouseUp, { once: true });
  };

  const columOptionItems = [
    {
      label: 'Populate column',
      onClick: onPopulateColumn,
      icon: <Sparkles disabled={shouldDisableAI} />,
      isNew: true,
      disabled: shouldDisableAI,
      tooltipContent: isQuotaLimitBeingReached ? (
        <UpgradePlanWarningTooltip
          workspaceId={id}
          quotaLimit={quotaLimit}
          maxQueryExecution={shouldDisableAI}
          showQueryQuotaLimit={isQuotaLimitBeingReached}
          featureCustomText="Unlock this feature"
          showUpgradeProButton={false}
        ></UpgradePlanWarningTooltip>
      ) : null,
    },
    {
      label: 'Add column left',
      onClick: onAddColLeft,
      icon: <AlignArrowLeft disabled={isFirst} />,
      disabled: isFirst,
    },
    {
      label: 'Add column right',
      onClick: onAddColRight,
      icon: <AlignArrowRight disabled={isFirst} />,
      disabled: isFirst,
    },
    {
      label: 'Remove column',
      onClick: onRemoveColumn,
      icon: <Delete disabled={length === 1} />,
      disabled: length === 1,
    },
  ];

  const showDragMenuToTheLeft = draggable && dragSource && isEditable;

  const hasErrors = error && error !== 'Expected expression';
  const chosenIcon = hasErrors ? (
    <Tooltip onClick={toggleOpen} trigger={<Warning />}>
      {type.kind !== 'table-formula'
        ? error
        : "There's a problem with your formulas"}
    </Tooltip>
  ) : showIcon ? (
    <Icon />
  ) : (
    <></>
  );
  const overrideWithUserSetWith = css({
    width: tempWidth.current ?? width,
  });

  const leftSide = showDragMenuToTheLeft ? (
    <DropdownMenu
      items={columOptionItems}
      testId="table-add-remove-column-button"
      styles={css(iconTypeStyles)}
      className="table-drag-handle"
      open={open}
      onChangeOpen={onChangeOpen}
      trigger={
        <DropSourceAndTarget
          ref={dragSource}
          draggingOver={draggingOver}
          onSelectColumn={onSelectColumn}
          toggleOpen={toggleOpen}
          icon={chosenIcon}
        />
      }
    />
  ) : (
    chosenIcon
  );

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
            display: 'inline-block',
          },
        },
        overrideWithUserSetWith,
      ]}
      ref={thRef}
      data-highlight={highlight}
      contentEditable={isEditable}
    >
      <div ref={sizeRef} css={[tableHeaderStyles, headerWrapperStyles]}>
        {dropDirection === 'left' && (
          <ColumnDropLine
            dropDirection={dropDirection}
            leftStyles={absoluteLeftAdjustment}
          />
        )}
        {dropDirection === 'right' && (
          <ColumnDropLine
            dropDirection={dropDirection}
            rightStyles={absoluteRightAdjustment}
          />
        )}
        <span
          onMouseDown={isEditable ? handleResize : noop}
          contentEditable={false}
          css={[resizeStyles, readOnly && { cursor: 'initial' }]}
        ></span>
        <div css={tableHeaderMenuStyles} contentEditable={false}>
          {leftSide}
        </div>

        <div
          data-testid="table-column-name"
          css={[
            childrenWrapperStyles,
            width && { maxWidth: tempWidth.current ?? width - 40 },
          ]}
          spellCheck={false}
        >
          {children}
        </div>

        <div css={tableHeaderMenuStyles} contentEditable={false}>
          {menu}
        </div>
      </div>
    </th>
  );
};
const absoluteRightAdjustment = css({
  top: -13,
  right: -12, // cell padding of 12px + border, left aligned
  height: 'calc(100% + 26px)', // yeah its the padding and borders again
});

const absoluteLeftAdjustment = css(absoluteRightAdjustment, {
  right: 'unset',
  left: -12,
});

const resizeStyles = css(absoluteRightAdjustment, {
  position: 'absolute',
  width: '1px',
  cursor: 'col-resize',
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
      : cssVar('backgroundHeavy'),
    // Keep hover effect when hovered, focused or the dropdown menu is opened.
    '&:hover, &:focus-within, &[data-highlight="true"]': {
      backgroundColor:
        color && swatchesThemed(darkMode)[color as AvailableSwatchColor].rgb,
    },
    minWidth: tdMinWidth,
    boxShadow:
      color &&
      `inset 0px -2px 0px ${baseSwatches[color as AvailableSwatchColor].rgb}`,
  });

const columnStyles = css(p13Medium, {
  minHeight: table.thMinHeight,
  padding: `${table.tdVerticalPadding}px ${table.tdHorizontalPadding}px`,
});

const headerWrapperStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
});

const iconTypeStyles = {
  display: 'inline-block',
  width: '16px',
  height: '16px',
};

const childrenWrapperStyles = css({
  overflow: 'hidden',
  borderRadius: '3px',
  mixBlendMode: 'luminosity',
});

const dragHandleStyles = css({
  display: 'block',
  pointerEvents: 'all',
  height: 16,
  width: 16,

  svg: {
    width: 9,
    height: 9,
    margin: 'auto',
    transform: 'translateY(45%)',
  },
  'svg > rect': {
    fill: 'transparent',
  },
});

const tableHeaderStyles = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  position: 'relative',
});

const tableHeaderMenuStyles = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  mixBlendMode: 'luminosity',
  svg: {
    width: 16,
    height: 16,
  },
});
