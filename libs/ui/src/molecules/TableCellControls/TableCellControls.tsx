import { css } from '@emotion/react';
import { once } from 'ramda';
import { forwardRef, useState } from 'react';
import { MenuItem, Tooltip } from '../../atoms';
import { Add, DragHandle, Trash } from '../../icons/index';
import {
  cssVar,
  mouseMovingOverTransitionDelay,
  p12Medium,
  p12Regular,
  setCssVar,
  shortAnimationDuration,
} from '../../primitives';
import { editorLayout } from '../../styles';
import { importTableDragHandleStyles } from '../../styles/table';
import { MenuList } from '../MenuList/MenuList';

export interface TableCellControlsProps {
  readonly onSelect?: () => void;
  readonly onRemove?: () => void;
  readonly onAddRowAbove?: () => void;
  readonly onAddRowBelow?: () => void;
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

export const TableCellControls = forwardRef<
  HTMLTableHeaderCellElement,
  TableCellControlsProps
>(({ readOnly, onSelect, onRemove, onAddRowAbove, onAddRowBelow }, ref) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const handleMenuClick = () => {
    if (onSelect) {
      onSelect();
    }
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
      ref={ref}
      css={{
        opacity: menuIsOpen ? 1 : 0,
        '*:hover > &': {
          opacity: 'unset',
        },
        transition: `opacity ${shortAnimationDuration} ease-in-out ${mouseMovingOverTransitionDelay}`,
        verticalAlign: 'middle',
      }}
    >
      {!readOnly && (
        <div css={gridStyles()}>
          <MenuList
            root
            open={menuIsOpen}
            onChangeOpen={setMenuIsOpen}
            trigger={menuButton}
            dropdown
          >
            <MenuItem icon={<Add />} onSelect={onAddRowAbove}>
              Add Above
            </MenuItem>
            {onRemove && (
              <MenuItem icon={<Trash />} onSelect={onRemove} selected={false}>
                Delete row
              </MenuItem>
            )}
            <MenuItem icon={<Add />} onSelect={onAddRowBelow}>
              Add below
            </MenuItem>
          </MenuList>

          <Tooltip trigger={menuButton} side="left">
            <span
              css={css(
                p12Regular,
                setCssVar('currentTextColor', cssVar('backgroundColor')),
                {
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }
              )}
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
      )}
    </th>
  );
});
