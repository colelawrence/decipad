/* eslint decipad/css-prop-named-variable: 0 */
import type { CellValueType } from '@decipad/editor-types';
import { ElementAttributes } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import {
  FC,
  ReactNode,
  forwardRef,
  useCallback,
  useContext,
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
  useEffect,
} from 'react';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';
import { useMergedRef } from '../../../hooks';
import { DragHandle as DragHandleIcon, Text, Warning } from '../../../icons';
import { p13Medium, useThemeColor } from '../../../primitives';
import { table } from '../../../styles';
import { tdMinWidth } from '../../../styles/table';
import { TableStyleContext, getStringType, getTypeIcon } from '../../../utils';
import { ColumnDropLine } from '../DropLine/ColumnDropLine';
import { Tooltip } from '../../../shared';

interface DropSourceAndTargetProps {
  readonly draggingOver: boolean;
  readonly toggleOpen: () => void;
  readonly onSelectColumn?: () => void;
  readonly icon?: ReactNode;
}

export type TableHeaderProps = Partial<DropSourceAndTargetProps> & {
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
} & React.DetailedHTMLProps<
    React.ThHTMLAttributes<HTMLTableCellElement>,
    HTMLTableCellElement
  >;

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
        },
      ]}
      ref={ref}
      contentEditable={false}
      onClick={() => {
        onSelectColumn?.();
        toggleOpen();
      }}
    >
      <span aria-roledescription="table-header-icon">{icon}</span>
      <span aria-roledescription="table-header-icon-handle">
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
  dragSource,
  dropTarget,
  dropDirection,
  onSelectColumn,
  error,
  ...props
}: TableHeaderProps): ReturnType<FC> => {
  const [tempWidth, setTempWidth] = useState<number | undefined>(undefined);
  const [open, onChangeOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    onChangeOpen(!open);
  }, [open]);

  const Icon = getTypeIcon(type);
  const { color } = useContext(TableStyleContext);

  const themeColor = useThemeColor(color || 'Catskill', true);

  const thRef = useMergedRef(attributes?.ref, dropTarget);
  const sizeRef = useRef<HTMLDivElement>(null);

  const handleResize = (mouseDownEvent: ReactMouseEvent) => {
    if (readOnly) {
      return;
    }

    mouseDownEvent.preventDefault();
    mouseDownEvent.stopPropagation();

    document.body.style.cursor = 'col-resize';

    const startSize = tempWidth ?? sizeRef.current?.offsetWidth ?? width ?? 150;
    const startPosition = mouseDownEvent.pageX;

    let newWidth: number | undefined;

    const onMouseMove = (mouseMoveEvent: MouseEvent) => {
      newWidth = Math.max(
        startSize - startPosition + mouseMoveEvent.pageX,
        tdMinWidth
      );
      setTempWidth(newWidth);
    };

    const onMouseUp = () => {
      document.body.removeEventListener('mousemove', onMouseMove);
      if (newWidth) setWidth?.(newWidth);
      document.body.style.cursor = 'auto';
    };

    document.body.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseup', onMouseUp, { once: true });
  };

  /**
   * Set tempWidth to undefined when the width prop changes. Waiting for the
   * width to change before unseting tempWidth prevents the width from
   * flickering, compared to unsetting tempWidth immediately on mouse up.
   */
  useEffect(() => {
    setTempWidth(undefined);
  }, [width]);

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
    width: tempWidth ?? width,
  });

  const leftSide = showDragMenuToTheLeft ? (
    <DropSourceAndTarget
      ref={dragSource}
      draggingOver={draggingOver}
      onSelectColumn={onSelectColumn}
      toggleOpen={toggleOpen}
      icon={chosenIcon}
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
        {
          backgroundColor: themeColor.Background.Subdued,
          minWidth: tdMinWidth,
          boxShadow:
            color && `inset 0px -2px 0px ${themeColor.Background.Default}`,

          '&:focus-within, &[data-highlight="true"]': {
            backgroundColor: themeColor.Background.Heavy,
          },
        },
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
      ]}
      ref={thRef}
      data-highlight={highlight}
      contentEditable={isEditable}
      {...props}
    >
      <div css={overrideWithUserSetWith} />
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
            width && { maxWidth: tempWidth ?? width - 40 },
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
  width: '3px',
  cursor: 'col-resize',
  transform: 'translateX(50%)',
});

const showDragHandleStyles = css({
  '[aria-roledescription="table-header-icon"]': {
    display: 'block',
  },
  '[aria-roledescription="table-header-icon-handle"]': {
    display: 'none',
  },
  ':hover, :active, :focus': {
    '[aria-roledescription="table-header-icon"]': {
      display: 'none',
    },
    '[aria-roledescription="table-header-icon-handle"]': {
      display: 'block',
    },
  },
});

const columnStyles = css(p13Medium, showDragHandleStyles, {
  minHeight: table.thMinHeight,
  padding: `${table.tdVerticalPadding}px ${table.tdHorizontalPadding}px`,
});

const headerWrapperStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
});

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
    height: '100%',
    width: '100%',
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
