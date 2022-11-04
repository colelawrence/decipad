import { css } from '@emotion/react';
import { once } from 'ramda';
import { FC, useState } from 'react';
import { MenuItem } from '../../atoms';
import { Crown, DragHandle } from '../../icons/index';
import {
  mouseMovingOverTransitionDelay,
  shortAnimationDuration,
} from '../../primitives';
import { editorLayout } from '../../styles';
import { importTableDragHandleStyles } from '../../styles/table';
import { MenuList } from '../MenuList/MenuList';

export interface ImportTableRowControlsProps {
  readonly isFirstRow?: boolean;
  readonly toggleFirstRowIsHeader: (isFirstRow: boolean) => void;
}

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

const importTableRowControlsWrapperStyles = css({
  '*:hover > &': {
    opacity: 'unset',
  },
  transition: `opacity ${shortAnimationDuration} ease-in-out ${mouseMovingOverTransitionDelay}`,
  verticalAlign: 'middle',
});

const menuOpenedStyles = css({
  opacity: 1,
});

const menuClosedStyles = css({
  opacity: 0,
});

export const ImportTableRowControls: FC<ImportTableRowControlsProps> = ({
  isFirstRow = false,
  toggleFirstRowIsHeader,
}) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const handleMenuClick = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  const menuButton = (
    <button onClick={() => handleMenuClick()} css={importTableDragHandleStyles}>
      <DragHandle />
    </button>
  );

  return (
    <th
      contentEditable={false}
      css={[
        importTableRowControlsWrapperStyles,
        menuIsOpen ? menuOpenedStyles : menuClosedStyles,
      ]}
    >
      {isFirstRow && (
        <div css={gridStyles()}>
          <MenuList
            root
            open={menuIsOpen}
            onChangeOpen={setMenuIsOpen}
            trigger={menuButton}
            dropdown
          >
            <MenuItem
              icon={<Crown />}
              onSelect={() => toggleFirstRowIsHeader(true)}
              selected={false}
            >
              Make this the header row
            </MenuItem>
          </MenuList>
        </div>
      )}
    </th>
  );
};
