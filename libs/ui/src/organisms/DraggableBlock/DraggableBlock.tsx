import { BlockIsActiveProvider } from '@decipad/react-contexts';
import {
  ComponentProps,
  FC,
  Fragment,
  HTMLProps,
  ReactNode,
  Ref,
  useState,
} from 'react';
import { ConnectDragSource } from 'react-dnd';
import { css, SerializedStyles } from '@emotion/react';
import { BlockDragHandle } from '..';
import { DropLine, EditorBlock, MenuItem, TriggerMenuItem } from '../../atoms';
import {
  mouseMovingOverTransitionDelay,
  Opacity,
  shortAnimationDuration,
} from '../../primitives';
import { blockAlignment, editorLayout } from '../../styles';
import { NewElementLine } from '../../atoms/NewElementLine/NewElementLine';
import { slimBlockWidth } from '../../styles/editor-layout';
import { MenuList } from '../../molecules';
import { CircularArrow } from '../../icons';

const handleWidth = 16;
const totalSpaceWithGap = handleWidth + editorLayout.gutterGap;

export const draggingOpacity: Opacity = 0.4;

const horizontalDropLineStyle = css({
  position: 'absolute',
  width: '100%',
  zIndex: 2,
});

// This positioning puts the dropLine in line with the NewElementLine.
const topDropLineStyle = css({ top: '4px' });
const bottomDropLineStyle = css({ bottom: '-6px' });

const verticalDropLineStyle = css({
  position: 'absolute',
  width: 'auto',
  height: '100%',
  top: 0,
  zIndex: 2,
});
const leftDropLineStyle = css({ left: `-6px` });
const rightDropLineStyle = css({ right: '-6px' });

const hiddenEditorBlockStyle = css({
  opacity: '.5',
  transition: 'opacity .2s ease',
});
const hiddenFocusedStyle = css({
  opacity: '1',
  filter: 'unset',
});

interface DraggableBlockProps extends ComponentProps<typeof EditorBlock> {
  readonly isSelected?: boolean;
  readonly isHidden?: boolean;
  readonly isBeingDragged?: boolean;
  readonly dropLine?: 'top' | 'bottom' | 'left' | 'right';

  readonly dragSource?: ConnectDragSource;
  readonly blockRef?: Ref<HTMLDivElement>;
  readonly previewRef?: Ref<HTMLDivElement>;

  readonly draggableCss?: SerializedStyles;

  readonly onMouseDown?: HTMLProps<HTMLDivElement>['onMouseDown'];
  readonly onShowHide?: (action: 'show' | 'hide') => void;
  readonly onDelete?: (() => void) | 'name-used' | 'none';
  readonly onDuplicate?: () => void;
  readonly onAdd?: () => void;
  readonly onPlus?: () => void;
  readonly onCopyHref?: () => void;
  readonly showLine?: boolean;

  readonly onTurnInto?: (value: string) => void;
  readonly turnInto?: { title: string; value: string }[];

  readonly children: ReactNode;

  readonly disableDrag?: boolean;

  /** Should the icons on the left be centered?
   * Tables for example shouldnt be
   */
  readonly isCentered?: boolean;
  readonly hasPreviousSibling?: boolean;
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

  onMouseDown,
  onDelete,
  onDuplicate,
  onAdd,
  onPlus,
  showLine = true,
  onShowHide,
  onCopyHref,

  onTurnInto,
  turnInto,

  blockKind,
  children,

  disableDrag = false,
  isCentered = false,
  hasPreviousSibling,

  ...props
}: DraggableBlockProps): ReturnType<FC> => {
  const [menuOpen, setMenuOpen] = useState(false);
  const BlockActiveProvider = menuOpen ? BlockIsActiveProvider : Fragment;

  const { typography } = blockAlignment[blockKind];

  const showEyeLabel = isHidden && !menuOpen;

  const dropLineEl = (
    <div
      contentEditable={false}
      css={[
        dropLine === 'top' && [horizontalDropLineStyle, topDropLineStyle],
        dropLine === 'bottom' && [horizontalDropLineStyle, bottomDropLineStyle],
        dropLine === 'left' && [verticalDropLineStyle, leftDropLineStyle],
        dropLine === 'right' && [verticalDropLineStyle, rightDropLineStyle],
      ]}
    >
      <DropLine
        variant={
          dropLine === 'left' || dropLine === 'right' ? 'inline' : 'block'
        }
      />
    </div>
  );

  return (
    <EditorBlock blockKind={blockKind} ref={blockRef} {...props}>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: `${handleWidth}px auto`,
          gridColumnGap: `${editorLayout.gutterGap}px`,

          marginLeft: `-${totalSpaceWithGap}px`,
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
                  `calc((
                  ${typography.lineHeight} * ${typography.fontSize}
                  -
                  ${editorLayout.gutterHandleHeight()}
                ) / 2
              )`
                : 0,

              // Draw over following blocks instead of increasing the current block's height
              height: 0,
            },
            isCentered
              ? {
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  marginLeft: '-32px',
                }
              : {
                  marginTop: '4px',
                },
            draggableCss,
          ]}
        >
          {!disableDrag && (
            <BlockDragHandle
              menuOpen={menuOpen}
              isHidden={isHidden}
              onMouseDown={onMouseDown}
              onChangeMenuOpen={setMenuOpen}
              onPlus={onPlus}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onShowHide={onShowHide}
              showEyeLabel={showEyeLabel}
              showAddBlock={!isHidden}
              onCopyHref={onCopyHref}
            >
              {turnInto != null && turnInto.length > 0 && (
                <MenuList
                  itemTrigger={
                    <TriggerMenuItem icon={<CircularArrow />}>
                      Turn into
                    </TriggerMenuItem>
                  }
                >
                  {turnInto.map((option) => (
                    <MenuItem
                      key={option.value}
                      onSelect={() => onTurnInto?.(option.value)}
                    >
                      {option.title}
                    </MenuItem>
                  ))}
                </MenuList>
              )}
            </BlockDragHandle>
          )}
        </div>
        <div
          css={[
            isBeingDragged ? { opacity: draggingOpacity } : {},
            isHidden ? hiddenEditorBlockStyle : {},
            isSelected || menuOpen ? hiddenFocusedStyle : {},
            // Duplication from `EditorBlock` but forces any rogue elements not to overflow.
            { maxWidth: slimBlockWidth, width: '100%' },
          ]}
          ref={previewRef}
        >
          {(dropLine === 'top' || dropLine === 'left') && dropLineEl}
          <NewElementLine
            onAdd={onAdd}
            show={showLine}
            hasPreviousSibling={hasPreviousSibling}
          />
          <BlockActiveProvider>{children}</BlockActiveProvider>
          {(dropLine === 'bottom' || dropLine === 'right') && dropLineEl}
        </div>
      </div>
    </EditorBlock>
  );
};
