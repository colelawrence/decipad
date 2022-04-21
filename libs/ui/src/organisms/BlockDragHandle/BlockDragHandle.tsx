import { css } from '@emotion/react';
import { FC } from 'react';
import { once } from 'ramda';
import { noop } from '@decipad/utils';
import { MenuItem, Tooltip } from '../../atoms';
import { Delete, DragHandle } from '../../icons';
import { MenuList } from '../../molecules';
import { editorLayout } from '../../styles';
import { p12Bold, p12Regular } from '../../primitives';

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

interface BlockDragHandleProps {
  readonly menuOpen?: boolean;
  readonly onChangeMenuOpen?: (newMenuOpen: boolean) => void;

  readonly onDelete?: (() => void) | false;
}

export const BlockDragHandle = ({
  menuOpen = false,
  onChangeMenuOpen = noop,
  onDelete = noop,
}: BlockDragHandleProps): ReturnType<FC> => {
  const menuButton = (
    <button
      onClick={() => onDelete !== false && onChangeMenuOpen(!menuOpen)}
      css={{ gridArea: 'handle' }}
    >
      <DragHandle />
    </button>
  );

  return (
    <div css={gridStyles()}>
      {menuOpen ? (
        menuButton
      ) : (
        <Tooltip trigger={menuButton}>
          <span
            css={css(p12Regular, { whiteSpace: 'nowrap', textAlign: 'center' })}
          >
            <strong css={css(p12Bold)}>Drag</strong> to move
            <br />
            <strong css={css(p12Bold)}>Click</strong> for options
          </span>
        </Tooltip>
      )}
      {/* onDelete is only false when disabled by the parent component */}
      {onDelete !== false && (
        <div css={{ gridArea: 'menu', zIndex: 1 }}>
          <MenuList root open={menuOpen} onChangeOpen={onChangeMenuOpen}>
            <MenuItem icon={<Delete />} onSelect={onDelete}>
              Delete
            </MenuItem>
          </MenuList>
        </div>
      )}
    </div>
  );
};
