/* eslint decipad/css-prop-named-variable: 0 */
import { css, SerializedStyles } from '@emotion/react';
import { ComponentProps, FC, ReactNode } from 'react';
import { ConnectDragSource } from 'react-dnd';

import { hideOnPrint, slimBlockWidth } from 'libs/ui/src/styles/editor-layout';
import {
  cssVar,
  largestDesktop,
  mouseMovingOverTransitionDelay,
  shortAnimationDuration,
} from '../../../primitives';
import { blockAlignment, editorLayout } from '../../../styles';
import { EditorBlock } from '../EditorBlock/EditorBlock';
import { NewElementLine } from '../NewElementLine/NewElementLine';

const handleWidth = 16;
const totalSpaceWithGap = handleWidth + editorLayout.gutterGap;

const hiddenEditorBlockStyle = css({
  opacity: '.5',
  transition: 'opacity .2s ease',
});
const hiddenFocusedStyle = css({
  opacity: '1',
  filter: 'unset',
});

export interface DraggableBlockProps
  extends ComponentProps<typeof EditorBlock> {
  readonly isSelected?: boolean;
  readonly isHidden?: boolean;
  readonly isBeingDragged?: boolean;
  readonly dragSource?: ConnectDragSource;
  readonly draggableCss?: SerializedStyles;
  readonly onAdd?: () => void;
  readonly showLine?: boolean;

  readonly children: ReactNode;

  readonly insideLayout?: boolean;
  readonly hasPadding?: boolean;
  readonly isMultipleSelection?: boolean;

  /** Should the icons on the left be centered?
   * Tables for example shouldnt be
   */
  readonly isCentered?: boolean;
  readonly hasPreviousSibling?: boolean;

  readonly elementId?: string;

  readonly DragHandle: ReactNode;
}
// eslint-disable-next-line complexity
export const DraggableBlock = ({
  DragHandle,
  draggableCss,
  isCentered,
  insideLayout,
  isSelected,
  blockKind,
  hasPadding,
  isHidden,
  fullWidth,
  fullHeight,
  elementId,
  isBeingDragged,
  dragSource,
  children,
  onAdd,
  showLine,
  hasPreviousSibling,
  layoutDirection,
  slateAttributes,
  blockRef,
}: DraggableBlockProps): ReturnType<FC> => {
  const { typography } = blockAlignment[blockKind];

  const handleInset = typography
    ? // Align with first line of text in addition to paddingTop
      `calc((
          ${typography.lineHeight}
          -
          ${editorLayout.gutterHandleHeight()}
        ) / 2
      )`
    : 0;

  const menuOpen = false;

  const showEyeLabel = isHidden && !menuOpen;

  return (
    <EditorBlock
      isHidden={isHidden}
      blockKind={blockKind}
      fullWidth={fullWidth}
      fullHeight={fullHeight}
      layoutDirection={layoutDirection}
      slateAttributes={slateAttributes}
      blockRef={blockRef}
    >
      <div
        data-element-id={elementId}
        css={[
          {
            display: 'grid',
            gridTemplateColumns: `${handleWidth}px auto`,
            gridColumnGap: `${editorLayout.gutterGap}px`,

            marginLeft: `-${totalSpaceWithGap}px`,
            transition: `margin-left ${shortAnimationDuration} ease-out`,
          },
          isBeingDragged && {
            '& > *': {
              opacity: 0,
            },
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              left: totalSpaceWithGap,
              right: 0,
              top: 0,
              bottom: 0,
              background: cssVar('backgroundDefault'),
              borderRadius: '0.5rem',
            },
          },
          fullHeight && { height: '100%' },
        ]}
      >
        <div
          contentEditable={false}
          ref={dragSource}
          css={[
            showEyeLabel
              ? {}
              : {
                  opacity: menuOpen ? 'unset' : 0,
                  '*:hover > &': {
                    opacity: 'unset',
                  },
                },
            {
              zIndex: 1,
              transition: `opacity ${shortAnimationDuration} ease-in-out ${mouseMovingOverTransitionDelay}`,
              paddingTop: handleInset,
              // Draw over following blocks instead of increasing the current block's height
              height: 0,
            },
            isCentered && {
              marginTop: 8,
            },
            draggableCss,
            insideLayout && {
              // TODO: Figure out where 36px comes from and deduplicate
              transform: `translateX(36px) translateX(${handleInset})`,
            },
          ]}
        >
          {DragHandle}
        </div>
        <div
          css={[
            isHidden ? hiddenEditorBlockStyle : {},
            isHidden ? hideOnPrint : {},
            isSelected || menuOpen ? hiddenFocusedStyle : {},
            // Duplication from `EditorBlock` but forces any rogue elements not to overflow.
            !insideLayout &&
              !fullWidth && { maxWidth: slimBlockWidth, width: '100%' },
            hasPadding && { padding: '0.75rem' },
          ]}
          // See LayoutColumn in @decipad/editor-components
          data-draggable-inside
        >
          <NewElementLine
            onAdd={onAdd}
            show={Boolean(showLine)}
            hasPreviousSibling={hasPreviousSibling}
          />
          <div css={selectedBlockStyles(menuOpen, Boolean(fullHeight))}>
            {children}
          </div>
        </div>
      </div>
    </EditorBlock>
  );
};

const selectedBlockStyles = (menuOpen: boolean, fullHeight: boolean) =>
  css([
    menuOpen && {
      'blockquote, h2, h3, .block-p': {
        backgroundColor: cssVar('backgroundDefault'),
        boxShadow: `0px 0px 0px 100vmin ${cssVar('backgroundDefault')}`,
        clipPath: `inset(0 -8px 0 -8px round 8px)`,
      },
      '.block-table': {
        backgroundColor: cssVar('backgroundDefault'),
        boxShadow: `0px 0px 0px 100vmin ${cssVar('backgroundDefault')}`,
        clipPath: `inset(0 -${largestDesktop.landscape.width}px 0 -20px round 8px)`,
      },
      '.block-code': {
        backgroundColor: cssVar('backgroundDefault'),
        clipPath: `inset(0 -8px 0 -8px round 8px)`,
      },
      '.block-figure': {
        clipPath: `inset(0 -8px 0 -8px round 8px)`,
        filter: 'brightness(0.9)',
      },
      '.block-li': {
        backgroundColor: cssVar('backgroundDefault'),
        boxShadow: `0px 0px 0px 100vmin ${cssVar('backgroundDefault')}`,
        clipPath: 'inset(-2px -8px -2px -8px round 8px)',
      },
    },
    fullHeight && { height: '100%' },
  ]);
