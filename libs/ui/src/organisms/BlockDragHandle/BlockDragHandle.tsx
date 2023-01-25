import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { once } from 'ramda';
import { FC, HTMLProps, ReactNode, useCallback, useState } from 'react';
import { MenuItem, Tooltip } from '../../atoms';
import {
  Delete,
  DragHandle,
  Duplicate,
  Hide,
  Link,
  Plus,
  Show,
} from '../../icons';
import { MenuList } from '../../molecules';
import { cssVar, p12Medium, p12Regular, setCssVar } from '../../primitives';
import { editorLayout } from '../../styles';
import { hideOnPrint } from '../../styles/editor-layout';
import { useEventNoEffect } from '../../utils/useEventNoEffect';

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
    background: cssVar('highlightColor'),
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

  height: '20px',
  width: '20px',
});

interface BlockDragHandleProps {
  readonly children?: ReactNode;
  readonly menuOpen?: boolean;
  readonly onMouseDown?: HTMLProps<HTMLDivElement>['onMouseDown'];
  readonly onChangeMenuOpen?: (newMenuOpen: boolean) => void;
  readonly isHidden?: boolean;
  readonly showEyeLabel?: boolean;
  readonly showAddBlock?: boolean;
  readonly onPlus?: () => void;
  readonly onDelete?: (() => void) | 'none' | 'name-used';
  readonly onDuplicate?: () => void;
  readonly onShowHide?: (action: 'show' | 'hide') => void;
  readonly onCopyHref?: () => void;
}

export const BlockDragHandle = ({
  children,
  menuOpen = false,
  isHidden = false,
  onShowHide = noop,
  showEyeLabel = false,
  onMouseDown,
  showAddBlock = true,
  onChangeMenuOpen = noop,
  onPlus = noop,
  onDelete = noop,
  onDuplicate = noop,
  onCopyHref,
}: BlockDragHandleProps): ReturnType<FC> => {
  const [isHovered, setIsHovered] = useState(false);

  const showAction = useCallback(() => onShowHide('show'), [onShowHide]);
  const hideAction = useCallback(() => onShowHide('hide'), [onShowHide]);
  const setHovered = useCallback(() => setIsHovered(true), [setIsHovered]);
  const setNotHovered = useCallback(() => setIsHovered(false), [setIsHovered]);

  const onClick = useCallback(() => {
    onDelete !== 'none' && onChangeMenuOpen(!menuOpen);
  }, [menuOpen, onChangeMenuOpen, onDelete]);

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

          {onCopyHref && (
            <MenuItem icon={<Link />} onSelect={onCopyHref}>
              Copy reference
            </MenuItem>
          )}

          {children}

          <MenuItem disabled>
            <hr css={{ color: cssVar('highlightColor') }} />
          </MenuItem>

          {/* onDelete can be disabled by the parent component */}
          {typeof onDelete === 'function' ? (
            <MenuItem icon={<Delete />} onSelect={onDelete}>
              Delete
            </MenuItem>
          ) : onDelete === 'name-used' ? (
            <MenuItem icon={<Delete color="weak" />} disabled onSelect={noop}>
              <Tooltip
                trigger={
                  <div css={{ color: cssVar('weakerTextColor') }}>Delete</div>
                }
              >
                Cannot delete because this name is used elsewhere
              </Tooltip>
            </MenuItem>
          ) : null}
        </MenuList>
      )}

      <Tooltip trigger={menuButton} side="bottom" hoverOnly>
        <span
          css={css([
            p12Regular,
            setCssVar('currentTextColor', cssVar('backgroundColor')),
            { whiteSpace: 'nowrap', textAlign: 'center' },
          ])}
        >
          <strong
            css={css([
              p12Medium,
              setCssVar('currentTextColor', cssVar('backgroundColor')),
            ])}
          >
            Drag
          </strong>{' '}
          to move
          <br />
          <strong
            css={css([
              p12Medium,
              setCssVar('currentTextColor', cssVar('backgroundColor')),
            ])}
          >
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
