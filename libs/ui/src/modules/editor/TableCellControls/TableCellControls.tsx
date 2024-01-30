/* eslint decipad/css-prop-named-variable: 0 */
import { once } from '@decipad/utils';
import { css } from '@emotion/react';
import { MouseEvent, forwardRef, useCallback, useState } from 'react';
import { MenuItem, Tooltip, MenuList } from '../../../shared';
import { DownArrow, DragHandle, Trash, UpArrow } from '../../../icons/index';
import {
  mouseMovingOverTransitionDelay,
  p12Medium,
  p12Regular,
  shortAnimationDuration,
} from '../../../primitives';
import { editorLayout } from '../../../styles';
import { normalDragHandleStyles } from '../../../styles/table';

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

  const handleMenuClick = useCallback(
    (ev: MouseEvent) => {
      if (onSelect) {
        onSelect();
      }
      setMenuIsOpen(!menuIsOpen);
      ev.stopPropagation();
      ev.preventDefault();
    },
    [menuIsOpen, onSelect]
  );

  const menuButton = (
    <button onClick={handleMenuClick} css={normalDragHandleStyles}>
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
      {!readOnly && menuIsOpen && (
        <div css={gridStyles()}>
          <MenuList
            root
            open={menuIsOpen}
            onChangeOpen={setMenuIsOpen}
            trigger={menuButton}
            dropdown
          >
            <MenuItem
              icon={<UpArrow />}
              onSelect={onAddRowAbove}
              testid="insert-row-above"
            >
              Insert Above
            </MenuItem>
            <MenuItem
              icon={<DownArrow />}
              onSelect={onAddRowBelow}
              testid="insert-row-below"
            >
              Insert Below
            </MenuItem>
            {onRemove && (
              <MenuItem
                icon={<Trash />}
                onSelect={onRemove}
                selected={false}
                testid="delete-row"
              >
                Delete
              </MenuItem>
            )}
          </MenuList>

          <Tooltip trigger={menuButton} side="left">
            <span
              css={css(
                p12Regular,

                {
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }
              )}
            >
              <strong css={css([p12Medium])}>Drag</strong> to move
              <br />
              <strong css={css([p12Medium])}>Click</strong> for options
            </span>
          </Tooltip>
        </div>
      )}
      {!readOnly && !menuIsOpen && <div css={gridStyles()}>{menuButton}</div>}
    </th>
  );
});
