import { assert, noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { componentCssVars, cssVar, p12Medium } from '../../../primitives';
import { MenuItem, MenuList, Tooltip } from '../../../shared';
import { editorLayout } from '../../../styles';
import { hideOnPrint } from '../../../styles/editor-layout';

const gridStyles = css(hideOnPrint, {
  display: 'grid',
  gridTemplateAreas: `
      ". plus handle"
      "menu . ."
    `,
  gridTemplateRows: `
      ${editorLayout.gutterHandleHeight()}
      auto
    `,
  justifyContent: 'end',
});

const handleButtonStyle = css({
  borderRadius: '6px',
  background: cssVar('backgroundMain'),

  ':hover': {
    background: cssVar('backgroundDefault'),
  },
});

export const handleStyle = css(handleButtonStyle, {
  cursor: 'grab',
  height: '20px',
  width: '20px',
  padding: '1px',
  color: cssVar('iconColorHeavy'),

  '> svg': {
    height: '100%',
  },
});

const eyeLabelStyles = css(handleButtonStyle, {
  height: '20px',
  width: '20px',
  padding: '2px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gridArea: 'plus',

  '> svg': {
    height: '100%',
  },
});

const handleSpanWrapper = css({
  gridArea: 'handle',
  height: '20px',
  width: '20px',
});

const tooltipTextStyles = css(p12Medium, {
  color: componentCssVars('TooltipText'),
  whiteSpace: 'nowrap',
  textAlign: 'center',
});

const menuDividerStyles = css({
  color: cssVar('backgroundDefault'),
});

export interface BlockDragHandleProps {
  readonly children?: ReactNode;

  readonly menuOpen: boolean;
  readonly insideLayout?: boolean;
  readonly onChangeMenuOpen: (newMenuOpen: boolean) => void;

  /**
   * The primary button.
   */
  readonly MainButton: ReactNode;

  /**
   * Displayed to the left of the drag handle.
   */
  readonly LeftButton: ReactNode;
}

// eslint-disable-next-line complexity
export const BlockDragHandle = ({
  children,
  menuOpen,

  MainButton,
  LeftButton,
  insideLayout = false,

  onChangeMenuOpen = noop,
}: BlockDragHandleProps): ReturnType<FC> => {
  const childrenArray = Children.toArray(children);
  assert(childrenArray.length > 0, 'Must have at least one child.');

  const menuItems = childrenArray.slice(0, childrenArray.length - 1);
  const lastMenuItem = childrenArray[childrenArray.length - 1];

  /**
   * Radix has issues combining components (Tooltip + DropdownMenu)
   * So we have to be clever.
   *
   * If the menu is open we don't render the tooltip,
   * this is because if we do, the tooltip will remain open if the user's mouse
   * is inside the menu (which is very annoying).
   *
   * Otherwise, we render the tooltip and the trigger.
   *
   */
  if (menuOpen) {
    return (
      <div css={gridStyles}>
        {!insideLayout && <div css={eyeLabelStyles}>{LeftButton}</div>}

        <MenuList
          root
          open={menuOpen}
          onChangeOpen={onChangeMenuOpen}
          trigger={
            <button
              data-testid="drag-handle"
              onClick={() => onChangeMenuOpen(!menuOpen)}
              css={handleStyle}
              tabIndex={-1}
            >
              {MainButton}
            </button>
          }
          dropdown
          side="left"
        >
          {menuItems}
          <MenuItem disabled>
            <hr css={menuDividerStyles} />
          </MenuItem>
          {lastMenuItem}
        </MenuList>
      </div>
    );
  } else {
    return (
      <div css={gridStyles}>
        {!insideLayout && <div css={eyeLabelStyles}>{LeftButton}</div>}

        <Tooltip
          trigger={
            <span css={handleSpanWrapper}>
              <button
                data-testid="drag-handle"
                onClick={() => onChangeMenuOpen(!menuOpen)}
                css={handleStyle}
                tabIndex={-1}
              >
                {MainButton}
              </button>
            </span>
          }
          side="bottom"
          hoverOnly
          offset={1}
        >
          <span css={tooltipTextStyles}>
            <strong>Drag</strong> to move
            <br />
            <strong>Click</strong> for options
          </span>
        </Tooltip>
      </div>
    );
  }
};
