import { ConnectDragSource } from 'react-dnd';
import { FC, ReactNode, RefObject, useState } from 'react';
import { BlockDragHandle } from '..';
import { DropLine } from '../../atoms';
import {
  mouseMovingOverTransitionDelay,
  Opacity,
  shortAnimationDuration,
} from '../../primitives';
import { editor, blockAlignment } from '../../styles';

const handleAndMenuReservedSpace = 172;
const totalSpaceWithGap = handleAndMenuReservedSpace + editor.gutterGap;

const draggingOpacity: Opacity = 0.4;

interface DraggableBlockProps {
  readonly isBeingDragged?: boolean;
  readonly dropLine?: 'top' | 'bottom';

  readonly dragSource?: ConnectDragSource;
  readonly blockRef?: RefObject<HTMLDivElement>;

  readonly onDelete?: () => void;

  readonly blockKind: keyof typeof blockAlignment;
  readonly children: ReactNode;
}
export const DraggableBlock = ({
  isBeingDragged = false,
  dropLine,

  dragSource,
  blockRef,

  onDelete,

  blockKind,
  children,
}: DraggableBlockProps): ReturnType<FC> => {
  const [menuOpen, setMenuOpen] = useState(false);

  const { paddingTop, typography } = blockAlignment[blockKind];

  return (
    <div
      css={{
        display: 'grid',
        gridTemplateColumns: `${handleAndMenuReservedSpace}px 1fr`,
        gridColumnGap: `${editor.gutterGap}px`,

        marginLeft: menuOpen
          ? // -totalSpaceWithGap when the free space on the left ((100vw - 100%) / 2)
            // is greater than totalSpaceWithGap (e.g. desktop); only -gutterGap otherwise
            `clamp(
              -${totalSpaceWithGap}px,
              (
                (100vw - 100%) / 2 - ${totalSpaceWithGap}px
              ) * -9999,
              -${editor.gutterGap}px
            )`
          : `-${totalSpaceWithGap}px`,
        justifyContent: 'end',
        transition: `margin-left ${shortAnimationDuration} ease-out`,
      }}
    >
      <div
        contentEditable={false}
        ref={dragSource}
        css={{
          opacity: menuOpen ? 'unset' : 0,
          '*:hover > &': {
            opacity: 'unset',
          },
          transition: `opacity ${shortAnimationDuration} ease-in-out ${mouseMovingOverTransitionDelay}`,

          paddingTop: typography
            ? // Align with first line of text in addition to paddingTop
              `calc(
                ${paddingTop}
                +
                (
                  ${typography.lineHeight} * ${typography.fontSize}
                  -
                  ${editor.gutterHandleHeight()}
                ) / 2
              )`
            : paddingTop,

          // Draw over following blocks instead of increasing the current block's height
          height: 0,
        }}
      >
        <BlockDragHandle
          menuOpen={menuOpen}
          onChangeMenuOpen={setMenuOpen}
          onDelete={onDelete}
        />
      </div>
      <div
        ref={blockRef}
        css={{ opacity: isBeingDragged ? draggingOpacity : 'unset' }}
      >
        {dropLine === 'top' && (
          <div contentEditable={false}>
            <DropLine />
          </div>
        )}
        {children}
        {dropLine === 'bottom' && (
          <div contentEditable={false}>
            <DropLine />
          </div>
        )}
      </div>
    </div>
  );
};
