import { css } from '@emotion/react';
import { FC } from 'react';
import { MenuItem, Tooltip } from '../../atoms';
import { Delete, DragHandle } from '../../icons';
import { MenuList } from '../../molecules';
import { p14Regular } from '../../primitives';
import { noop, getSvgAspectRatio } from '../../utils';

const handleHeight = `calc(${p14Regular.lineHeight} * ${p14Regular.fontSize})`;
const handleWidth = `calc(${getSvgAspectRatio(
  <DragHandle />
)} * ${handleHeight})`;

const gridStyles = css({
  display: 'grid',
  gridTemplate: `
    ".     handle        " ${handleHeight}
    "menu  .             " auto
    /144px ${handleWidth}
  `,
  justifyContent: 'end',
});

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
    <div css={gridStyles}>
      {menuOpen ? (
        menuButton
      ) : (
        <Tooltip trigger={menuButton}>Click for options</Tooltip>
      )}
      <div css={{ gridArea: 'menu' }}>
        <MenuList root open={menuOpen} onChangeOpen={onChangeMenuOpen}>
          <MenuItem icon={<Delete />} onSelect={onDelete}>
            Delete
          </MenuItem>
        </MenuList>
      </div>
    </div>
  );
};
