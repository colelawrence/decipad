import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { FC, Fragment, ReactNode, RefObject, useState } from 'react';
import { ConnectDragSource } from 'react-dnd';
import { css, SerializedStyles } from '@emotion/react';
import { BlockDragHandle } from '..';
import { DropLine, EditorBlock } from '../../atoms';
import {
  mouseMovingOverTransitionDelay,
  Opacity,
  shortAnimationDuration,
} from '../../primitives';
import { blockAlignment, editorLayout } from '../../styles';
import { NewElementLine } from '../../atoms/NewElementLine/NewElementLine';

const handleAndMenuReservedSpace = 172;
const totalSpaceWithGap = handleAndMenuReservedSpace + editorLayout.gutterGap;

export const draggingOpacity: Opacity = 0.4;

const blockWrapperStyle = css({ position: 'relative' });
const dropLineStyle = css({ position: 'absolute', width: '100%' });

const hiddenEditorBlockStyle = css({
  opacity: '.5',
  transition: 'opacity .2s ease',
});

const hiddenFocusedStyle = css({
  opacity: '1',
  filter: 'unset',
});

const dropLineEl = (
  <div contentEditable={false} css={dropLineStyle}>
    <DropLine />
  </div>
);

interface DraggableBlockProps {
  readonly isSelected?: boolean;
  readonly isHidden?: boolean;
  readonly isBeingDragged?: boolean;
  readonly dropLine?: 'top' | 'bottom';

  readonly dragSource?: ConnectDragSource;
  readonly blockRef?: RefObject<HTMLDivElement>;
  readonly previewRef?: RefObject<HTMLDivElement>;

  readonly draggableCss?: SerializedStyles;

  readonly onShowHide?: (action: 'show' | 'hide') => void;
  readonly onDelete?: (() => void) | false;
  readonly onDuplicate?: () => void;
  readonly onAdd?: () => void;
  readonly onPlus?: () => void;
  readonly onCopyHref?: () => void;
  readonly showLine?: boolean;

  readonly blockKind: keyof typeof blockAlignment;
  readonly children: ReactNode;
}
export const DraggableBlock = ({
  isSelected = false,
  isHidden = false,
  isBeingDragged = false,
  dropLine,

  dragSource,
  blockRef,
  previewRef,

  draggableCss,

  onDelete,
  onDuplicate,
  onAdd,
  onPlus,
  showLine = true,
  onShowHide,
  onCopyHref,

  blockKind,
  children,
}: DraggableBlockProps): ReturnType<FC> => {
  const [menuOpen, setMenuOpen] = useState(false);
  const BlockActiveProvider = menuOpen ? BlockIsActiveProvider : Fragment;

  const { paddingTop, typography } = blockAlignment[blockKind];

  const showEyeLabel = isHidden && !menuOpen;

  const editorBlock = (
    <EditorBlock blockKind={blockKind}>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: `${handleAndMenuReservedSpace}px minmax(0, 1fr)`,
          gridColumnGap: `${editorLayout.gutterGap}px`,

          marginLeft: menuOpen
            ? // -totalSpaceWithGap when the free space on the left ((100vw - 100%) / 2)
              // is greater than totalSpaceWithGap (e.g. desktop); only -gutterGap otherwise
              `clamp(
              -${totalSpaceWithGap}px,
              (
                (100vw - 100%) / 2 - ${totalSpaceWithGap}px
              ) * -9999,
              -${editorLayout.gutterGap}px
            )`
            : `-${totalSpaceWithGap}px`,
          justifyContent: 'end',
          transition: `margin-left ${shortAnimationDuration} ease-out`,
        }}
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
              transition: `opacity ${shortAnimationDuration} ease-in-out ${mouseMovingOverTransitionDelay}`,

              paddingTop: typography
                ? // Align with first line of text in addition to paddingTop
                  `calc(
                ${paddingTop}
                +
                (
                  ${typography.lineHeight} * ${typography.fontSize}
                  -
                  ${editorLayout.gutterHandleHeight()}
                ) / 2
              )`
                : paddingTop,

              // Draw over following blocks instead of increasing the current block's height
              height: 0,
            },
            draggableCss,
          ]}
        >
          <BlockDragHandle
            menuOpen={menuOpen}
            isHidden={isHidden}
            onChangeMenuOpen={setMenuOpen}
            onPlus={onPlus}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onShowHide={onShowHide}
            showEyeLabel={showEyeLabel}
            onCopyHref={onCopyHref}
          />
        </div>
        <div
          css={[
            isBeingDragged ? { opacity: draggingOpacity } : {},
            isHidden ? hiddenEditorBlockStyle : {},
            isSelected || menuOpen ? hiddenFocusedStyle : {},
          ]}
          ref={previewRef}
        >
          <NewElementLine onAdd={onAdd} show={showLine} />
          <BlockActiveProvider>{children}</BlockActiveProvider>
        </div>
      </div>
    </EditorBlock>
  );

  return (
    <div ref={blockRef} css={blockWrapperStyle}>
      {dropLine === 'top' && dropLineEl}
      {editorBlock}
      {dropLine === 'bottom' && dropLineEl}
    </div>
  );
};
