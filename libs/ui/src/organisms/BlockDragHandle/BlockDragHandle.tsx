/* eslint decipad/css-prop-named-variable: 0 */
import type { BlockDependents } from '@decipad/remote-computer';
import { noop, once } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, HTMLProps, ReactNode, useCallback, useState } from 'react';
import { MenuItem, Tooltip, TriggerMenuItem } from '../../atoms';
import {
  Delete,
  DragHandle,
  Duplicate,
  Hide,
  Link,
  Plus,
  Show,
  Sparkles,
  Switch,
} from '../../icons';
import { DeleteWithDepsMenuItem, MenuList } from '../../molecules';
import { componentCssVars, cssVar, p12Medium } from '../../primitives';
import { editorLayout } from '../../styles';
import { useEventNoEffect } from '../../utils/useEventNoEffect';
import { hideOnPrint } from '../../styles/editor-layout';
import { TabElement } from '@decipad/editor-types';

const gridStyles = once(() =>
  css({
    display: 'grid',
    gridTemplate: `
      ".                          plus handle                             " ${editorLayout.gutterHandleHeight()}
      "menu                       .    .                                  " auto
      /minmax(max-content, 144px) ${editorLayout.gutterHandleWidth()}
    `,
    justifyContent: 'end',
  })
);

const handleButtonStyle = css({
  borderRadius: '6px',

  ':hover': {
    background: cssVar('backgroundDefault'),
  },
});

const eyeLabelStyles = css(handleButtonStyle, {
  height: '20px',
  width: '20px',
  padding: '2px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '> svg': {
    height: '100%',
  },
});

const handleStyle = css(handleButtonStyle, {
  gridArea: 'handle',
  cursor: 'grab',
  height: '20px',
  width: '20px',
  marginLeft: '2px',
});

const plusStyle = css(handleButtonStyle, {
  gridArea: 'plus',
  cursor: 'pointer',
  color: cssVar('iconColorHeavy'),
  height: '20px',
  width: '20px',
});

interface BlockDragHandleProps {
  readonly children?: ReactNode;
  readonly menuOpen?: boolean;
  readonly dependenciesForBlock?: BlockDependents[];
  readonly onMouseDown?: HTMLProps<HTMLDivElement>['onMouseDown'];
  readonly onChangeMenuOpen?: (newMenuOpen: boolean) => void;
  readonly isHidden?: boolean;
  readonly isMultipleSelection?: boolean;
  readonly showEyeLabel?: boolean;
  readonly showAddBlock?: boolean;
  readonly onPlus?: () => void;
  readonly onDelete?: (() => void) | 'none';
  readonly onDuplicate?: () => void;
  readonly onShowHide?: (action: 'show' | 'hide') => void;
  readonly onCopyHref?: () => void;
  readonly onMoveToTab?: (tabId: string) => void;
  readonly tabs?: Array<TabElement>;
  readonly aiPanel?: {
    text: string;
    visible: boolean;
    toggle: () => void;
  };
}

export const BlockDragHandle = ({
  children,
  menuOpen = false,
  isHidden = false,
  isMultipleSelection = false,
  onShowHide = noop,
  showEyeLabel = false,
  onMouseDown,
  showAddBlock = true,
  onChangeMenuOpen = noop,
  tabs = [],
  onPlus = noop,
  onDelete = noop,
  onDuplicate = noop,
  onMoveToTab,
  onCopyHref,
  dependenciesForBlock,
  aiPanel,
}: BlockDragHandleProps): ReturnType<FC> => {
  const [isHovered, setIsHovered] = useState(false);

  const showAction = useCallback(() => onShowHide('show'), [onShowHide]);
  const hideAction = useCallback(() => onShowHide('hide'), [onShowHide]);
  const setHovered = useCallback(() => setIsHovered(true), [setIsHovered]);
  const setNotHovered = useCallback(() => setIsHovered(false), [setIsHovered]);

  const onClick = useCallback(() => {
    onDelete !== 'none' && onChangeMenuOpen(!menuOpen);
  }, [menuOpen, onChangeMenuOpen, onDelete]);

  const isThisBlockUsedInCalculations =
    Array.isArray(dependenciesForBlock) && dependenciesForBlock.length !== 0;

  const showHidden = showEyeLabel && !isHovered;
  const menuButton = (
    <div
      data-testid="drag-handle"
      onMouseEnter={setHovered}
      onMouseLeave={setNotHovered}
      onClick={onClick}
      css={[handleStyle, !showHidden && css({ padding: '5px' })]}
    >
      {showHidden ? <EyeLabel /> : <DragHandle />}
    </div>
  );

  const showHideButton = isHidden ? (
    <MenuItem icon={<Show />} onSelect={showAction}>
      Show to reader
    </MenuItem>
  ) : (
    <MenuItem icon={<Hide />} onSelect={hideAction}>
      Hide from reader
    </MenuItem>
  );

  const plusButton = (
    <button onClick={useEventNoEffect(onPlus)} css={plusStyle}>
      <Plus />
    </button>
  );

  const aiButton = aiPanel ? (
    <MenuItem icon={<Sparkles />} onSelect={aiPanel.toggle} isNew>
      AI assistance
    </MenuItem>
  ) : null;

  return (
    <div css={[gridStyles(), hideOnPrint]} onMouseDown={onMouseDown}>
      {showAddBlock && (
        <Tooltip trigger={plusButton} side="bottom" hoverOnly>
          <span css={css({ whiteSpace: 'nowrap', textAlign: 'center' })}>
            <strong>Click</strong> to add block below
          </span>
        </Tooltip>
      )}

      {menuOpen && (
        <MenuList
          root
          open={menuOpen}
          onChangeOpen={onChangeMenuOpen}
          trigger={menuButton}
          dropdown
          side="left"
        >
          {showHideButton}
          <MenuItem icon={<Duplicate />} onSelect={onDuplicate}>
            Duplicate
          </MenuItem>
          {onCopyHref && !isMultipleSelection && (
            <MenuItem icon={<Link />} onSelect={onCopyHref}>
              Copy reference
            </MenuItem>
          )}
          {onMoveToTab && tabs.length > 0 && (
            <MenuList
              itemTrigger={
                <TriggerMenuItem icon={<Switch />}>Move to tab</TriggerMenuItem>
              }
            >
              {tabs.map((t) => (
                <MenuItem
                  key={t.id}
                  icon={<Link />}
                  onSelect={() => onMoveToTab(t.id)}
                >
                  <div css={{ minWidth: '132px' }}>{t.name}</div>
                </MenuItem>
              ))}
            </MenuList>
          )}
          {children}
          {!isMultipleSelection ? aiButton : null}
          <MenuItem disabled>
            <hr css={{ color: cssVar('backgroundDefault') }} />
          </MenuItem>
          {/* onDelete can be disabled by the parent component */}
          {isThisBlockUsedInCalculations ? (
            <DeleteWithDepsMenuItem
              blockInfo={dependenciesForBlock[0]}
              onSelect={typeof onDelete === 'function' ? onDelete : noop}
            />
          ) : typeof onDelete === 'function' ? ( // dependency graph
            <MenuItem icon={<Delete />} onSelect={onDelete}>
              Delete
            </MenuItem>
          ) : null}
        </MenuList>
      )}

      <Tooltip trigger={menuButton} side="bottom" hoverOnly>
        <span
          css={css([
            p12Medium,
            { color: componentCssVars('TooltipText') },
            { whiteSpace: 'nowrap', textAlign: 'center' },
          ])}
        >
          <strong css={[p12Medium, { color: componentCssVars('TooltipText') }]}>
            Drag
          </strong>{' '}
          to move
          <br />
          <strong css={[p12Medium, { color: componentCssVars('TooltipText') }]}>
            Click
          </strong>{' '}
          for options
        </span>
      </Tooltip>
    </div>
  );
};

const EyeLabel = () => (
  <div css={eyeLabelStyles} contentEditable={false}>
    <Hide />
  </div>
);
