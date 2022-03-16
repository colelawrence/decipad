import { css } from '@emotion/react';
import { FC } from 'react';
import { once } from 'ramda';
import { MenuItem, Tooltip } from '../../atoms';
import { Delete, DragHandle } from '../../icons';
import { MenuList } from '../../molecules';
import { noop } from '../../utils';
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

  readonly onDelete?: () => void;
}

export const BlockDragHandle = ({
  menuOpen = false,
  onChangeMenuOpen = noop,
  onDelete = noop,
}: BlockDragHandleProps): ReturnType<FC> => {
  const menuButton = (
    <button
      onClick={() => onChangeMenuOpen(!menuOpen)}
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
      <div css={{ gridArea: 'menu', zIndex: 1 }}>
        <MenuList root open={menuOpen} onChangeOpen={onChangeMenuOpen}>
          <MenuItem icon={<Delete />} onSelect={onDelete}>
            Delete
          </MenuItem>
        </MenuList>
      </div>
    </div>
  );
};
