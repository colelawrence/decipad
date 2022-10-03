import { css } from '@emotion/react';
import { once } from 'ramda';
import { forwardRef, useState } from 'react';
import { MenuItem, Tooltip } from '../../atoms';
import { DragHandle, Trash } from '../../icons/index';
import {
  cssVar,
  setCssVar,
  mouseMovingOverTransitionDelay,
  p12Bold,
  p12Regular,
  shortAnimationDuration,
} from '../../primitives';
import { editorLayout } from '../../styles';
import { MenuList } from '../MenuList/MenuList';

export interface TableCellControlsProps {
  readonly onSelect?: () => void;
  readonly onRemove?: () => void;
  readonly readOnly?: boolean;
}

export interface MenuButtonProps {
  readonly setMenuIsOpen: (menuIsOpen: boolean) => void;
  readonly menuIsOpen: boolean;
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

export const TableCellControls = forwardRef<
  HTMLTableHeaderCellElement,
  TableCellControlsProps
>(({ readOnly, onSelect, onRemove }, ref) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const handleMenuClick = () => {
    if (onSelect) {
      onSelect();
    }
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
      ref={ref}
      css={{
        opacity: menuIsOpen ? 1 : 0,
        '*:hover > &': {
          opacity: 'unset',
        },
        transition: `opacity ${shortAnimationDuration} ease-in-out ${mouseMovingOverTransitionDelay}`,
        verticalAlign: 'middle',
        paddingRight: '6px',
      }}
    >
      {!readOnly ? (
        <div css={gridStyles()}>
          <MenuList
            root
            open={menuIsOpen}
            onChangeOpen={setMenuIsOpen}
            trigger={menuButton}
            dropdown
          >
            {onRemove ? (
              <MenuItem
                icon={<Trash />}
                onSelect={() => onRemove()}
                selected={false}
              >
                Delete
              </MenuItem>
            ) : null}
          </MenuList>

          <Tooltip trigger={menuButton} side="left">
            <span
              css={css(p12Regular, {
                whiteSpace: 'nowrap',
                textAlign: 'center',
              })}
            >
              <strong css={css(p12Bold)}>Drag</strong> to move
              <br />
              <strong css={css(p12Bold)}>Click</strong> for options
            </span>
          </Tooltip>
        </div>
      ) : null}
    </th>
  );
});
