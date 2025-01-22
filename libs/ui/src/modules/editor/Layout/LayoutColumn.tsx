/* eslint decipad/css-prop-named-variable: 0 */
import { FC, ReactNode, useState } from 'react';
import { css } from '@emotion/react';
import {
  componentCssVars,
  cssVar,
  cssVarHex,
  shortAnimationDuration,
  transparencyHex,
} from 'libs/ui/src/primitives';
import { droppablePatternStyles } from 'libs/ui/src/styles/droppablePattern';
import { useThemeFromStore } from '@decipad/react-contexts';
import { swatchesThemed } from 'libs/ui/src/utils';
import { ConnectDropTarget } from 'react-dnd';
import { layoutColumnGap } from './Layout';

const borderColor = cssVar('borderDefault');

export type LayoutColumnBorderMode = 'always' | 'hover' | 'never';

const itemStyles = css({
  position: 'relative',

  '> div:nth-of-type(1)': {
    display: 'grid',
    gridTemplateColumns: 'auto',
  },

  border: 'solid 1px transparent',
  borderRadius: '0.5rem',
});

const borderStyles = (borderMode: LayoutColumnBorderMode) =>
  css([
    borderMode !== 'never' && {
      transitionProperty: 'border-color',
      transitionDuration: shortAnimationDuration,
    },
    borderMode === 'hover' && {
      '[data-type="layout"]:hover &': {
        borderColor,
      },
    },
    borderMode === 'always' && {
      borderColor,
    },
  ]);

const dragOverStyles = css({
  /**
   * Can't use border, since increasing border width causes layout shift even
   * with box-sizing: border-box.
   */
  boxShadow: `0 0 0 2px ${componentCssVars('DropLineColor')}`,
});

const resizeHandleWrapperStyles = css({
  position: 'absolute',
  top: 0,
  bottom: 0,
  right: '-1px', // Account for border
  transform: 'translateX(100%)',
  width: `${layoutColumnGap}px`,
  cursor: 'col-resize',
  zIndex: 1,
  display: 'flex',
});

const resizeHandleStyles = (isResizing: boolean) =>
  css([
    {
      margin: 'auto',
      height: '100%',
      maxHeight: '64px',
      width: '3px',
      background: cssVarHex('borderDefault'),
      borderRadius: '3px',
      opacity: '0%',
      transitionProperty: 'opacity',
      transitionDuration: shortAnimationDuration,
      '[data-type="layout"]:hover &': {
        opacity: '50%',
      },
      '*:hover > &': {
        opacity: '100% !important',
      },
    },
    isResizing && { opacity: '100% !important' },
  ]);

export interface LayoutColumnProps {
  readonly children: ReactNode;
  readonly relativeWidth: number;
  readonly resizable: boolean;
  readonly minWidth: number;
  readonly getCurrentWidth: () => number;
  readonly getMaxWidth: () => number;
  readonly setWidthOverride: (factor: number) => void;
  readonly commitWidthOverride: () => void;
  readonly borderMode: LayoutColumnBorderMode;
  readonly isDragging: boolean;
  readonly isDragOver: boolean;
  readonly connectDropTarget: ConnectDropTarget;
}

export const LayoutColumn: FC<LayoutColumnProps> = ({
  children,
  relativeWidth,
  resizable,
  minWidth,
  getCurrentWidth,
  getMaxWidth,
  setWidthOverride,
  commitWidthOverride,
  borderMode,
  isDragging,
  isDragOver,
  connectDropTarget,
}) => {
  const [darkTheme] = useThemeFromStore();
  const { Catskill, Malibu } = swatchesThemed(darkTheme);
  const [isResizing, setIsResizing] = useState(false);

  const draggingStyles = isDragOver
    ? droppablePatternStyles(
        transparencyHex(Malibu.hex, 0.16),
        transparencyHex(Malibu.hex, 0.3)
      )
    : droppablePatternStyles(
        transparencyHex(Catskill.hex, 0.08),
        transparencyHex(Catskill.hex, 0.2)
      );

  const onPointerDown = (downEvent: React.PointerEvent) => {
    downEvent.preventDefault();

    const initialWidth = getCurrentWidth();
    const initialMouseX = downEvent.clientX;
    const maxWidth = getMaxWidth();

    setIsResizing(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - initialMouseX;
      const newWidth = Math.min(
        Math.max(minWidth, initialWidth + deltaX),
        maxWidth
      );
      setWidthOverride(newWidth);
    };

    document.addEventListener('pointermove', onPointerMove);

    document.addEventListener(
      'pointerup',
      () => {
        commitWidthOverride();
        setIsResizing(false);
        document.removeEventListener('pointermove', onPointerMove);
      },
      { once: true }
    );
  };

  /**
   * We have to only apply the `connectDropTarget` when we are `isDragging`,
   * this is because LI will block drag events when certain nested parts
   * are hovered over.
   */
  return (
    <li
      ref={isDragging ? connectDropTarget : null}
      css={[
        itemStyles,
        borderStyles(borderMode),
        isDragging && draggingStyles,
        isDragOver && dragOverStyles,
      ]}
      style={{
        flexGrow: relativeWidth,
        flexBasis: '1px',
        minWidth: `${minWidth}px`,
      }}
    >
      {children}

      {resizable && (
        <div
          contentEditable={false}
          css={resizeHandleWrapperStyles}
          onPointerDown={onPointerDown}
        >
          <div css={resizeHandleStyles(isResizing)} />
        </div>
      )}
    </li>
  );
};
