import { css } from '@emotion/react';
import { once } from 'ramda';
import { FC, useState } from 'react';
import { MenuItem } from '../../atoms';
import { Crown, DragHandle } from '../../icons/index';
import {
  cssVar,
  setCssVar,
  mouseMovingOverTransitionDelay,
  shortAnimationDuration,
} from '../../primitives';
import { editorLayout } from '../../styles';
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

const dragHandleStyles = css({
  gridArea: 'handle',
  cursor: 'grab',
  width: '16px',
  borderRadius: '2px',
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),

  ':hover': {
    background: cssVar('highlightColor'),
  },
});

const importTableRowControlsWrapperStyles = css({
  '*:hover > &': {
    opacity: 'unset',
  },
  transition: `opacity ${shortAnimationDuration} ease-in-out ${mouseMovingOverTransitionDelay}`,
  verticalAlign: 'middle',
  paddingRight: '6px',
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
    <button onClick={() => handleMenuClick()} css={dragHandleStyles}>
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
