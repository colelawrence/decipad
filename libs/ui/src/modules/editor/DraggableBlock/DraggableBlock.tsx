/* eslint decipad/css-prop-named-variable: 0 */
import type { BlockDependents } from '@decipad/remote-computer';
import { css, SerializedStyles } from '@emotion/react';
import { ComponentProps, FC, HTMLProps, ReactNode, Ref, useState } from 'react';
import { ConnectDragSource } from 'react-dnd';

import { TabElement } from '@decipad/editor-types';
import { hideOnPrint, slimBlockWidth } from 'libs/ui/src/styles/editor-layout';
import { Path } from 'slate';
import { Rotate } from '../../../icons';
import {
  cssVar,
  largestDesktop,
  mouseMovingOverTransitionDelay,
  shortAnimationDuration,
} from '../../../primitives';
import { MenuItem, MenuList, TriggerMenuItem } from '../../../shared';
import { blockAlignment, editorLayout } from '../../../styles';
import { BlockDragHandle } from '../BlockDragHandle/BlockDragHandle';
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

interface DraggableBlockProps extends ComponentProps<typeof EditorBlock> {
  readonly isSelected?: boolean;
  readonly isHidden?: boolean;
  readonly isBeingDragged?: boolean;
  readonly path?: Path;

  readonly dragSource?: ConnectDragSource;
  readonly blockRef?: Ref<HTMLDivElement>;
  readonly dependenciesForBlock?: BlockDependents[];

  readonly draggableCss?: SerializedStyles;

  readonly onMouseDown?: HTMLProps<HTMLDivElement>['onMouseDown'];
  readonly onShowHide?: (action: 'show' | 'hide') => void;
  readonly onAnnotation?: () => void;
  readonly onDelete?: (() => void) | 'none';
  readonly onDuplicate?: () => void;
  readonly onAdd?: () => void;
  readonly onPlus?: () => void;
  readonly onCopyHref?: () => void;
  readonly onMoveToTab?: (tabId: string) => void;
  readonly onMakeFullWidth?: () => void;
  readonly tabs?: Array<TabElement>;
  readonly showLine?: boolean;

  readonly onTurnInto?: (value: string) => void;
  readonly aiPanel?: {
    text: string;
    readonly visible: boolean;
    readonly toggle: () => void;
  };

  readonly turnInto?: { title: string; value: string }[];

  readonly children: ReactNode;

  readonly insideLayout?: boolean;
  readonly hasPadding?: boolean;
  readonly isMultipleSelection?: boolean;

  /** Should the icons on the left be centered?
   * Tables for example shouldnt be
   */
  readonly isCentered?: boolean;
  readonly hasPreviousSibling?: boolean;

  // Downloadable
  readonly isDownloadable?: boolean;
  readonly onDownload?: () => void;
  readonly handleDownloadChart?: () => void;
  readonly needsUpgrade?: boolean;

  readonly elementId?: string;
}
// eslint-disable-next-line complexity
export const DraggableBlock = ({
  isSelected = false,
  isHidden = false,
  isBeingDragged = false,

  elementId,

  dragSource,
  blockRef,

  draggableCss,
  tabs = [],

  onMoveToTab,
  onMakeFullWidth,
  onMouseDown,
  onAnnotation,
  onDelete,
  onDuplicate,
  onAdd,
  onPlus,
  showLine = true,
  onShowHide,
  onCopyHref,

  dependenciesForBlock,

  onTurnInto,
  turnInto,

  blockKind,
  children,

  isMultipleSelection = false,
  insideLayout = false,
  hasPadding = false,
  fullWidth = false,
  fullHeight = false,
  isCentered = false,
  hasPreviousSibling,

  aiPanel,

  isDownloadable,
  onDownload,
  handleDownloadChart,
  needsUpgrade = false,
  path,
  ...props
}: DraggableBlockProps): ReturnType<FC> => {
  const [menuOpen, setMenuOpen] = useState(false);

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

  const showEyeLabel = isHidden && !menuOpen;

  return (
    <EditorBlock
      isHidden={isHidden}
      blockKind={blockKind}
      fullWidth={fullWidth}
      fullHeight={fullHeight}
      ref={blockRef}
      {...props}
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
          <BlockDragHandle
            menuOpen={menuOpen}
            isHidden={isHidden}
            isMultipleSelection={isMultipleSelection}
            dependenciesForBlock={dependenciesForBlock}
            onMouseDown={onMouseDown}
            onChangeMenuOpen={setMenuOpen}
            onPlus={onPlus}
            onAnnotation={onAnnotation}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onShowHide={onShowHide}
            onMoveToTab={onMoveToTab}
            onMakeFullWidth={onMakeFullWidth}
            tabs={tabs}
            showEyeLabel={showEyeLabel}
            showAddBlock={!isHidden && !insideLayout}
            onCopyHref={onCopyHref}
            aiPanel={aiPanel}
            isDownloadable={isDownloadable}
            onDownload={onDownload}
            handleDownloadChart={handleDownloadChart}
            needsUpgrade={needsUpgrade}
            path={path}
          >
            {!isMultipleSelection &&
              turnInto != null &&
              turnInto.length > 0 && (
                <MenuList
                  itemTrigger={
                    <TriggerMenuItem icon={<Rotate />}>
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
            show={showLine}
            hasPreviousSibling={hasPreviousSibling}
          />
          <div css={selectedBlockStyles(menuOpen, fullHeight)}>{children}</div>
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
