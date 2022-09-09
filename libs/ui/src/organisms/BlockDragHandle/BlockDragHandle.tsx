import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { once } from 'ramda';
import { FC, useCallback, useState } from 'react';
import { MenuItem, Tooltip } from '../../atoms';
import { Delete, Hide, Show, DragHandle, Duplicate, Link } from '../../icons';
import { MenuList } from '../../molecules';
import { cssVar, p12Bold, p12Regular, setCssVar } from '../../primitives';
import { editorLayout } from '../../styles';

const gridStyles = once(() =>
  css({
    display: 'grid',
    gridTemplate: `
      ".                          handle                             " ${editorLayout.gutterHandleHeight()}
      "menu                       .                                  " auto
      /minmax(max-content, 144px) ${editorLayout.gutterHandleWidth()}
    `,
    justifyContent: 'end',
  })
);

const eyeLabelStyles = css(
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    height: '20px',
    width: '16px',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    background: cssVar('highlightColor'),
    borderRadius: '2px',

    '> svg': {
      height: '100%',
    },
  }
);

interface BlockDragHandleProps {
  readonly menuOpen?: boolean;
  readonly onChangeMenuOpen?: (newMenuOpen: boolean) => void;
  readonly isHidden?: boolean;
  readonly showEyeLabel?: boolean;
  readonly onDelete?: (() => void) | false;
  readonly onDuplicate?: () => void;
  readonly onShowHide?: (action: 'show' | 'hide') => void;
  readonly onCopyHref?: () => void;
}

export const BlockDragHandle = ({
  menuOpen = false,
  isHidden = false,
  onShowHide = noop,
  showEyeLabel = false,
  onChangeMenuOpen = noop,
  onDelete = noop,
  onDuplicate = noop,
  onCopyHref,
}: BlockDragHandleProps): ReturnType<FC> => {
  const [isHovered, setIsHovered] = useState(false);

  const showAction = useCallback(() => onShowHide('show'), [onShowHide]);
  const hideAction = useCallback(() => onShowHide('hide'), [onShowHide]);
  const setHovered = useCallback(() => setIsHovered(true), [setIsHovered]);
  const setNotHovered = useCallback(() => setIsHovered(false), [setIsHovered]);

  const menuButton = (
    <button
      onMouseEnter={setHovered}
      onMouseLeave={setNotHovered}
      onClick={() => onDelete !== false && onChangeMenuOpen(!menuOpen)}
      css={{ gridArea: 'handle', cursor: 'grab' }}
    >
      {showEyeLabel && !isHovered ? <EyeLabel /> : <DragHandle />}
    </button>
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

  return (
    <div css={gridStyles()}>
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

        <MenuItem disabled>
          <hr css={{ color: cssVar('highlightColor') }} />
        </MenuItem>

        {/* onDelete is only false when disabled by the parent component */}
        {onDelete !== false && (
          <MenuItem icon={<Delete />} onSelect={onDelete}>
            Delete
          </MenuItem>
        )}
      </MenuList>

      <Tooltip trigger={menuButton} side="left">
        <span
          css={css(p12Regular, { whiteSpace: 'nowrap', textAlign: 'center' })}
        >
          <strong css={css(p12Bold)}>Drag</strong> to move
          <br />
          <strong css={css(p12Bold)}>Click</strong> for options
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
